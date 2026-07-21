import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  createUserRequest,
  deleteUserRequest,
  listUsersRequest,
  updateUserRequest,
  WorkflowError,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/Modal";
import { Toast } from "../components/Toast";
import { UserForm } from "../components/UserForm";
import { ROLE_META } from "../lib/statusStyles";
import type { ManagedUser, ManagedUserFormInput } from "../types";
import {
  Avatar,
  Badge,
  Banner,
  Button,
  DataTable,
  EmptyState,
  IconButton,
  PageHeader,
  type Column,
  pageContainer,
} from "../components/ui";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR");
}

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function loadUsers() {
    setIsLoading(true);
    listUsersRequest()
      .then((data) => {
        setUsers(data);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(
          err instanceof WorkflowError
            ? err.message
            : "Impossible de charger les utilisateurs.",
        );
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openCreateForm() {
    setEditingUser(null);
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(user: ManagedUser) {
    setEditingUser(user);
    setFormError(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(input: ManagedUserFormInput) {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingUser) {
        const updated = await updateUserRequest(editingUser.id, input, currentUser?.id ?? "");
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
        setToastMessage(`Utilisateur ${updated.fullName} mis à jour`);
      } else {
        const created = await createUserRequest(input, currentUser?.id ?? "");
        setUsers((prev) => [created, ...prev]);
        setToastMessage(`Utilisateur ${created.fullName} créé avec succès`);
      }
      setIsFormOpen(false);
    } catch (err) {
      setFormError(
        err instanceof WorkflowError ? err.message : "Une erreur inattendue est survenue.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingUser) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteUserRequest(deletingUser.id, currentUser?.id ?? "");
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      setToastMessage(`Utilisateur ${deletingUser.fullName} supprimé`);
      setDeletingUser(null);
    } catch (err) {
      setDeleteError(
        err instanceof WorkflowError ? err.message : "Une erreur inattendue est survenue.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns: Column<ManagedUser>[] = [
    {
      key: "user",
      header: "Utilisateur",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.fullName} />
          <div>
            <div className="font-semibold text-ink-900">
              {user.fullName}
              {user.id === currentUser?.id && (
                <span className="ml-2 text-xs font-normal text-ink-400">
                  (vous)
                </span>
              )}
            </div>
            <div className="text-xs text-ink-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rôle",
      render: (user) => (
        <Badge tone={ROLE_META[user.role]?.tone ?? "slate"}>{user.role}</Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Créé le",
      render: (user) => formatDate(user.createdAt),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (user) => (
        <div className="flex justify-end gap-1.5">
          <IconButton onClick={() => openEditForm(user)} aria-label="Modifier">
            <Pencil size={16} />
          </IconButton>
          <IconButton
            tone="danger"
            onClick={() => {
              setDeleteError(null);
              setDeletingUser(user);
            }}
            disabled={user.id === currentUser?.id}
            title={
              user.id === currentUser?.id
                ? "Vous ne pouvez pas supprimer votre propre compte"
                : undefined
            }
            aria-label="Supprimer"
          >
            <Trash2 size={16} />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      variants={pageContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}

      <PageHeader
        description="Gestion des comptes de l'application — création, modification et suppression des utilisateurs."
        actions={
          <Button shine fullWidth={false} onClick={openCreateForm}>
            <Plus size={16} />
            Nouvel utilisateur
          </Button>
        }
      />

      {loadError && <Banner tone="red">{loadError}</Banner>}

      <DataTable
        columns={columns}
        rows={users}
        rowKey={(user) => user.id}
        isLoading={isLoading}
        empty={
          <EmptyState
            icon={Users}
            title="Aucun utilisateur"
            description="Créez le premier compte utilisateur de la plateforme."
            action={
              <Button fullWidth={false} onClick={openCreateForm}>
                <Plus size={16} />
                Nouvel utilisateur
              </Button>
            }
          />
        }
      />

      {isFormOpen && (
        <Modal
          title={editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
          onClose={() => setIsFormOpen(false)}
        >
          {formError && (
            <Banner tone="red" className="mb-4">
              {formError}
            </Banner>
          )}
          <UserForm
            initialUser={editingUser ?? undefined}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            submitting={isSubmitting}
          />
        </Modal>
      )}

      {deletingUser && (
        <Modal title="Supprimer l'utilisateur" onClose={() => setDeletingUser(null)}>
          {deleteError && (
            <Banner tone="red" className="mb-4">
              {deleteError}
            </Banner>
          )}
          <p className="text-sm text-ink-600">
            Voulez-vous vraiment supprimer{" "}
            <span className="font-semibold text-ink-900">{deletingUser.fullName}</span> (
            {deletingUser.email}) ? Cette action est irréversible.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="outline"
              fullWidth={false}
              type="button"
              onClick={() => setDeletingUser(null)}
            >
              Annuler
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-xl bg-status-red-fg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

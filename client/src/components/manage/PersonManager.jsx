import React, { useState } from 'react';
import { User, Plus, Edit2, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useExpenseContext } from '../../context/ExpenseContext';
import { personApi } from '../../api/personApi';

export const PersonManager = () => {
  const { people, refreshAll } = useExpenseContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deletePersonId, setDeletePersonId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditingPerson(null);
    setName('');
    setIsModalOpen(true);
  };

  const openEdit = (person) => {
    setEditingPerson(person);
    setName(person.name);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingPerson) {
        await personApi.update(editingPerson._id, { name: name.trim() });
        toast.success('Person updated successfully');
      } else {
        await personApi.create({ name: name.trim() });
        toast.success('Person added successfully');
      }
      setIsModalOpen(false);
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to save person');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePersonId) return;
    setIsDeleting(true);
    try {
      await personApi.delete(deletePersonId);
      toast.success('Person removed successfully');
      setDeletePersonId(null);
      await refreshAll();
    } catch (err) {
      toast.error(err.message || 'Failed to delete person');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Household Members & Spenders"
          subtitle="Manage the people who pay for expenses in your household ('whose money')"
          action={
            <Button variant="primary" size="sm" icon={Plus} onClick={openCreate}>
              Add Spender
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {people.map((person) => (
              <div
                key={person._id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-slate-900 text-sm">{person.name}</h4>
                      {person.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">Household Spender</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(person)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-700 hover:bg-slate-100"
                    aria-label={`Edit ${person.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletePersonId(person._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    aria-label={`Delete ${person.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPerson ? 'Edit Spender' : 'Add Household Spender'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Spender / Person Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Father, Mother, Self, Roommate"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-1 focus:ring-brand-600 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {editingPerson ? 'Update' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletePersonId)}
        onClose={() => setDeletePersonId(null)}
        onConfirm={handleDelete}
        title="Remove Spender"
        message="Are you sure you want to remove this person? If they have existing expense records, deletion will be blocked to preserve historical accuracy."
        confirmLabel="Remove Person"
        isLoading={isDeleting}
      />
    </div>
  );
};

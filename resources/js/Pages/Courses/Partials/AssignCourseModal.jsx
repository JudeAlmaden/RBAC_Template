import React, { useState, useEffect, useRef } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';
import { Search, UserCheck, CalendarDays } from 'lucide-react';
import Avatar from '@/Components/Avatar';
import { useDebounce } from '@/hooks/useDebounce';

export default function AssignCourseModal({ show, onClose, course }) {
    const [userSearch, setUserSearch]     = useState('');
    const [userResults, setUserResults]   = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSearching, setIsSearching]   = useState(false);
    const debouncedSearch = useDebounce(userSearch, 300);
    const abortRef = useRef(null);

    const form = useForm({
        user_id:  '',
        due_at:   '',
        required: true,
    });

    // Fetch assignable users whenever the debounced search or course changes
    useEffect(() => {
        if (!course || !show) return;

        if (abortRef.current) {
            abortRef.current.abort();
        }

        const controller = new AbortController();
        abortRef.current = controller;

        setIsSearching(true);

        fetch(route('courses.assignable-users', course.id) + (debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : ''), {
            signal: controller.signal,
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((r) => r.json())
            .then((data) => {
                setUserResults(data);
                setIsSearching(false);
            })
            .catch(() => {
                setIsSearching(false);
            });
    }, [debouncedSearch, course?.id, show]);

    // Reset state when modal closes
    useEffect(() => {
        if (!show) {
            setUserSearch('');
            setUserResults([]);
            setSelectedUser(null);
            form.reset();
        }
    }, [show]);

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        form.setData('user_id', user.id);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedUser) return;

        form.post(route('courses.assign', course.id), {
            onSuccess: () => {
                onClose();
            },
        });
    };

    if (!course) return null;

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                    Assign Course
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    Assign <span className="font-medium text-gray-700 dark:text-gray-200">"{course.title}"</span> to a learner.
                </p>

                <div className="space-y-4">
                    {/* User Search */}
                    <div>
                        <InputLabel value="Select Learner" />
                        <div className="relative mt-1 mb-2">
                            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={userSearch}
                                onChange={(e) => {
                                    setUserSearch(e.target.value);
                                    setSelectedUser(null);
                                    form.setData('user_id', '');
                                }}
                                placeholder="Search by name or email..."
                                className="w-full pl-8 pr-4 py-2 text-xs bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#5B5FC7] focus:outline-none transition"
                            />
                        </div>

                        {/* Selected User pill */}
                        {selectedUser && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#5B5FC7]/10 border border-[#5B5FC7]/30 mb-2">
                                <UserCheck className="w-3.5 h-3.5 text-[#5B5FC7] shrink-0" />
                                <span className="text-xs font-medium text-[#5B5FC7] dark:text-[#8A8DE2]">
                                    {selectedUser.name}
                                </span>
                                <span className="text-[10px] text-gray-400">{selectedUser.email}</span>
                            </div>
                        )}

                        {/* Results list */}
                        {!selectedUser && (
                            <div className="max-h-44 overflow-y-auto rounded-lg border border-[#E8E8EC] dark:border-[#26262D] bg-[#FAFAFC] dark:bg-[#121217]">
                                {isSearching ? (
                                    <div className="p-3 text-xs text-center text-gray-400">Searching…</div>
                                ) : userResults.length === 0 ? (
                                    <div className="p-3 text-xs text-center text-gray-400">
                                        {userSearch ? 'No matching learners found.' : 'All eligible learners are already enrolled.'}
                                    </div>
                                ) : (
                                    userResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => handleSelectUser(user)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs hover:bg-white dark:hover:bg-[#1C1C24] transition text-left border-b border-[#E8E8EC] dark:border-[#26262D] last:border-0"
                                        >
                                            <Avatar name={user.name} size="w-6 h-6" />
                                            <div className="min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate">{user.name}</div>
                                                <div className="text-[10px] text-gray-400 truncate">{user.email}</div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        <InputError message={form.errors.user_id} className="mt-1" />
                    </div>

                    {/* Due Date */}
                    <div>
                        <InputLabel htmlFor="assign-due-at" value="Due Date (optional)" />
                        <div className="relative mt-1">
                            <CalendarDays className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                            <input
                                id="assign-due-at"
                                type="datetime-local"
                                value={form.data.due_at}
                                onChange={(e) => form.setData('due_at', e.target.value)}
                                className="w-full pl-8 pr-4 py-2 text-xs bg-white dark:bg-[#15151A] border border-[#E8E8EC] dark:border-[#26262D] rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#5B5FC7] focus:outline-none transition"
                            />
                        </div>
                        <InputError message={form.errors.due_at} className="mt-1" />
                    </div>

                    {/* Required toggle */}
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={form.data.required}
                            onChange={(e) => form.setData('required', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#5B5FC7] focus:ring-[#5B5FC7]"
                        />
                        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">Mark as required</span>
                    </label>
                </div>

                <div className="mt-6 flex justify-end gap-2.5">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton
                        disabled={form.processing || !selectedUser}
                        className="!bg-[#5B5FC7] hover:!bg-[#484CB8]"
                    >
                        Assign Course
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}


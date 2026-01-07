'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Trash2, Edit2, Loader2, UserPlus } from 'lucide-react'
import { api, type User, type Staff } from '@/lib/api'
import { toast } from 'react-toastify'

export function StaffManagement() {
    const [users, setUsers] = useState<Staff[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form state
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'staff'>('staff')
    const [processing, setProcessing] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const data = await api.getStaff()
            setUsers(data.staff)
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to load staff members')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async () => {
        if (!username || !email || !password) {
            toast.error('Please fill in all fields')
            return
        }

        setProcessing(true)
        try {
            await api.createStaff({ username, email, password, role })
            toast.success('Staff member added successfully')
            setIsDialogOpen(false)
            fetchUsers()
            // Reset form
            setUsername('')
            setEmail('')
            setPassword('')
            setRole('staff')
        } catch (error) {
            console.error(error)
            toast.error('Failed to add staff member')
        } finally {
            setProcessing(false)
        }
    }

    const handleRoleUpdate = async (staffId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'staff' : 'admin'
        
        // Optimistic update
        setUsers(users.map(u => u._id === staffId ? { ...u, role: newRole as any } : u))

        try {
            await api.updateStaffRole(staffId, newRole)
            toast.success(`Role updated to ${newRole}`)
        } catch (error) {
            console.error(error)
            toast.error('Failed to update role')
            // Revert on failure
            setUsers(users.map(u => u._id === staffId ? { ...u, role: currentRole as any } : u))
        }
    }

    const handleDeleteUser = async (_id: string) => {
        if (!confirm('Are you sure you want to remove this staff member?')) return

        try {
            await api.deleteUser(_id)
            setUsers(users.filter(u => u._id !== _id))
            toast.success('Staff member removed')
        } catch (error) {
            console.error(error)
            toast.error('Failed to remove staff member')
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        <div className="p-8 pb-20">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Staff Management</h1>
                    <p className="text-muted-foreground">Manage user access and roles</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Staff
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Staff Member</DialogTitle>
                            <DialogDescription>
                                Create a new account for a staff member. They will receive an email with login details.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="AKDebug01" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Temporary Password</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <div className="flex gap-4">
                                    <Button
                                        variant={role === 'staff' ? 'default' : 'outline'}
                                        onClick={() => setRole('staff')}
                                        type="button"
                                        className="flex-1"
                                    >
                                        Staff
                                    </Button>
                                    <Button
                                        variant={role === 'admin' ? 'default' : 'outline'}
                                        onClick={() => setRole('admin')}
                                        type="button"
                                        className="flex-1"
                                    >
                                        Admin
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreateUser} disabled={processing}>
                                {processing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Create Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        No staff members found
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Username</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <button 
                                            onClick={() => handleRoleUpdate(user._id, user.role)}
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${user.role === 'admin'
                                            ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                            }`}
                                            title="Click to toggle role"
                                        >
                                            {user.role}
                                        </button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600" onClick={() => handleDeleteUser(user._id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    )
}

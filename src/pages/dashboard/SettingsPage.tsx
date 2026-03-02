import * as React from 'react';
import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Button, Input, Card, CardBody } from '@heroui/react';

export default function SettingsPage() {
    const userId = localStorage.getItem('userId');
    const user = useQuery((api as any).auth.getUser, userId ? { userId } : "skip");
    const updateUser = useMutation((api as any).auth.updateUser);

    const [name, setName] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    React.useEffect(() => {
        if (user?.name) setName(user.name);
    }, [user]);

    const handleSave = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            await updateUser({ userId, name });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (user === undefined) return <div className="p-8 text-text-muted font-medium">Loading...</div>;

    const plans = [
        { name: 'Free', price: '0 XAF', features: ['1 event', 'Basic template', 'Watermark', 'Limited capacity'], current: true },
        { name: 'Event Pass', price: '15,000 XAF/event', features: ['Premium template', 'No watermark', 'Higher limits', 'QR passes'], current: false },
        { name: 'Studio', price: '25,000 XAF/month', features: ['Multiple events', 'Analytics', 'CSV export', 'Priority support'], current: false },
        { name: 'Agency', price: '75,000 XAF/month', features: ['Team seats', 'White-label', 'All features', 'Dedicated support'], current: false },
    ];

    return (
        <div className="p-8 lg:p-12 max-w-4xl mx-auto">
            <div className="mb-10">
                <h1 className="font-display text-3xl md:text-4xl text-text-main mb-2">Settings</h1>
                <p className="text-text-muted">Manage your account and preferences.</p>
            </div>

            {/* Profile Section */}
            <Card className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)] mb-8">
                <CardBody className="p-8">
                    <h2 className="font-display text-xl text-text-main mb-6">Profile</h2>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main">Full Name</label>
                            <Input
                                value={name}
                                onValueChange={setName}
                                placeholder="Your name"
                                variant="bordered"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-text-main">Email Address</label>
                            <Input
                                value={user?.email ?? ''}
                                isReadOnly
                                variant="bordered"
                                description="Email cannot be changed."
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                onPress={handleSave}
                                color="primary"
                                isDisabled={saving}
                                className="font-semibold rounded-full"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            {saved && (
                                <span className="text-primary text-sm font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">check_circle</span> Saved
                                </span>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Plans Section */}
            <Card className="bg-surface rounded-2xl border border-border shadow-[var(--shadow-card)]">
                <CardBody className="p-8">
                    <h2 className="font-display text-xl text-text-main mb-2">Plans & Billing</h2>
                    <p className="text-text-muted text-sm mb-6">Choose the plan that fits your needs.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`p-5 rounded-2xl border-2 transition-all ${plan.current
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/30'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-text-main">{plan.name}</h3>
                                    {plan.current && (
                                        <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">Current</span>
                                    )}
                                </div>
                                <p className="font-display text-lg text-text-main mb-4">{plan.price}</p>
                                <ul className="space-y-2">
                                    {plan.features.map((f) => (
                                        <li key={f} className="text-xs text-text-muted flex items-start gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm mt-0.5">check</span>
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                {!plan.current && (
                                    <Button size="sm" variant="bordered" className="w-full mt-4 font-semibold rounded-full text-xs">
                                        Upgrade
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}

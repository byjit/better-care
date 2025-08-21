'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { trpc } from '@/utils/trpc'
import { toast } from 'sonner'
import { Loader2, MessageSquarePlus } from 'lucide-react'

export default function NewChatPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const createConsultation = trpc.consultation.create.useMutation({
        onSuccess: (data) => {
            toast.success('Consultation created successfully!')
            router.push(`/chat/${data.id}`)
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to create consultation')
            setIsSubmitting(false)
        }
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim() || !description.trim()) {
            toast.error('Please fill in all fields')
            return
        }

        setIsSubmitting(true)

        try {
            await createConsultation.mutateAsync({
                title: title.trim(),
                description: description.trim()
            })
        } catch (error) {
            // Error is handled in onError callback
        }
    }

    return (
        <div className="container max-w-2xl mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <MessageSquarePlus className="h-8 w-8 text-primary" />
                    Start New Consultation
                </h1>
                <p className="text-muted-foreground mt-2">
                    Describe your health concern and a qualified doctor will assist you
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Consultation Details</CardTitle>
                    <CardDescription>
                        Please provide a clear title and detailed description of your health concern
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Consultation Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Knee pain after exercise, Persistent headaches, etc."
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={isSubmitting}
                                className="w-full"
                            />
                            <p className="text-sm text-muted-foreground">
                                Provide a brief, clear title for your consultation
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Please describe your symptoms, when they started, their severity, and any other relevant details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={isSubmitting}
                                className="min-h-[120px] resize-none"
                            />
                            <p className="text-sm text-muted-foreground">
                                Include symptoms, duration, severity, and any relevant medical history
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !title.trim() || !description.trim()}
                                className="flex-1"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <MessageSquarePlus className="mr-2 h-4 w-4" />
                                        Create Consultation
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">What happens next?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your consultation will be visible to available doctors</li>
                    <li>• A qualified doctor will review and accept your consultation</li>
                    <li>• You'll be able to chat with the doctor in real-time</li>
                    <li>• You can also interact with our AI assistant using @ai</li>
                </ul>
            </div>
        </div>
    )
}

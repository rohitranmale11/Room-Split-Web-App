import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getContacts } from "@/app/actions/contacts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, Edit, Trash2 } from "lucide-react";
import AddContactForm from "./add-contact-form";
import EditContactForm from "./edit-contact-form";
import { Suspense } from "react";

export default async function ContactsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return <div>Please log in to view contacts.</div>;
  }

  const contacts = await getContacts();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your contacts for expense splitting
          </p>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <AddContactForm />
        </Suspense>
      </div>

      {contacts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first contact to start splitting expenses with people who aren't on RoomSplit
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {contact.name}
                  <div className="flex space-x-1">
                    <Suspense fallback={<div>Loading...</div>}>
                      <EditContactForm contact={contact} />
                    </Suspense>
                  </div>
                </CardTitle>
                <CardDescription>
                  Contact since {new Date(contact.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.email && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { createActivity } from "@/lib/activity";

export async function createContact(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be logged in to add a contact");
  }

  // Verify user exists in database before proceeding
  const existingUser = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!existingUser) {
    throw new Error("User account not found. Please log out and log back in.");
  }

  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;

  if (!name || name.trim().length === 0) {
    throw new Error("Contact name is required");
  }

  // Check for duplicate email if provided
  if (email) {
    const existingContact = await db.contact.findUnique({
      where: {
        ownerId_email: {
          ownerId: session.user.id,
          email: email,
        },
      },
    });

    if (existingContact) {
      throw new Error("A contact with this email already exists");
    }
  }

  const contact = await db.contact.create({
    data: {
      name: name.trim(),
      phone,
      email,
      ownerId: session.user.id,
    },
  });

  // Create activity
  await createActivity(
    "CONTACT_ADDED",
    session.user.id,
    {
      contactId: contact.id,
      contactName: contact.name,
    }
  );

  revalidatePath("/dashboard/contacts");

  return { success: true, contact };
}

export async function updateContact(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be logged in to update a contact");
  }

  const contactId = formData.get("contactId") as string;
  const name = formData.get("name") as string;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.trim() || null;

  if (!name || name.trim().length === 0) {
    throw new Error("Contact name is required");
  }

  // Verify contact belongs to user
  const existingContact = await db.contact.findUnique({
    where: { id: contactId }
  });

  if (!existingContact || existingContact.ownerId !== session.user.id) {
    throw new Error("Contact not found or access denied");
  }

  // Check for duplicate email if provided and different from current
  if (email && email !== existingContact.email) {
    const duplicateContact = await db.contact.findUnique({
      where: {
        ownerId_email: {
          ownerId: session.user.id,
          email: email,
        },
      },
    });

    if (duplicateContact) {
      throw new Error("A contact with this email already exists");
    }
  }

  const contact = await db.contact.update({
    where: { id: contactId },
    data: {
      name: name.trim(),
      phone,
      email,
    },
  });

  // Create activity
  await createActivity(
    "CONTACT_UPDATED",
    session.user.id,
    {
      contactId: contact.id,
      contactName: contact.name,
    }
  );

  revalidatePath("/dashboard/contacts");

  return { success: true, contact };
}

export async function deleteContact(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("You must be logged in to delete a contact");
  }

  const contactId = formData.get("contactId") as string;

  // Verify contact belongs to user
  const existingContact = await db.contact.findUnique({
    where: { id: contactId }
  });

  if (!existingContact || existingContact.ownerId !== session.user.id) {
    throw new Error("Contact not found or access denied");
  }

  const contact = await db.contact.delete({
    where: { id: contactId },
  });

  // Create activity
  await createActivity(
    "CONTACT_DELETED",
    session.user.id,
    {
      contactId: contact.id,
      contactName: contact.name,
    }
  );

  revalidatePath("/dashboard/contacts");

  return { success: true, contact };
}

export async function getContacts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  const contacts = await db.contact.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return contacts;
}

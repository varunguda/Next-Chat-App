"use server";

import { z } from "zod";
import { fetchRedis } from "./redis";
import { Resend } from "resend";
import YelpRecentLoginEmail from "../ui/templates/sendRequestEmail";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

const AddFriendFormSchema = z.object({
  email: z
    .string({ invalid_type_error: "Please enter an email address" })
    .email("Please enter a valid email address"),
});

export type AddFriendState = {
  errors?: {
    email?: string[];
  };
  message?: string | null;
};

export async function addFriend(prevState: AddFriendState, formData: FormData) {
  console.log(formData.get("email"));
  const validateFields = AddFriendFormSchema.safeParse({
    email: formData.get("email"),
  });
  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
    };
  }

  const { email: emailToAdd } = AddFriendFormSchema.parse(
    Object.fromEntries(formData.entries()),
  );
  const idToAdd = (await fetchRedis(
    "get",
    `user:email:${emailToAdd}`,
  )) as string;

  const session = await getServerSession(authConfig);

  console.log({ emailToAdd });

  if (!idToAdd) {
    const resend = new Resend(process.env.RESEND_KEY);
    const { data } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: emailToAdd,
      subject: "A New Request!!",
      react: YelpRecentLoginEmail({ userMail: session?.user.email! }),
    });
    console.log({ data });
    return {
      message: "Request Sent Successfully!",
    };
  }
}

// const FormSchema = z.object({
//   id: z.string(),
//   customerId: z.string({
//     invalid_type_error: "Please select a customer.",
//   }),
//   amount: z.coerce
//     .number()
//     .gt(0, { message: "Please enter an amount that is greater than $0." }),
//   status: z.enum(["pending", "paid"], {
//     invalid_type_error: "Please select an invoice status.",
//   }),
//   date: z.string(),
// });
//
// export type State = {
//   errors?: {
//     customerId?: string[];
//     amount?: string[];
//     status?: string[];
//   };
//   message?: string | null;
// };
//
// export async function createInvoice(prevState: State, formData: FormData) {
//   const validateFields = AddFriendFormSchema.safeParse({
//     email: formData.get("email"),
//   });
//
//   if (!validateFields.success) {
//     return {
//       errors: validateFields.error.flatten().fieldErrors,
//       message: "Missing fields, failed to create invoice.",
//     };
//   }
//   const { email } = AddFriendFormSchema.parse(
//     Object.fromEntries(formData.entries()),
//   );
//   try {
//     // await sql`
//     //   INSERT INTO invoices (customer_id, amount, status, date)
//     //   VALUES (${customerId}, ${amountCents}, ${status}, ${date})
//     // `;
//   } catch (err) {
//     return {
//       message: "Database Error: Error while creating an invoice!",
//     };
//   }
//   // revalidatePath('/dashboard/invoices');
//   // redirect('/dashboard/invoices');
// }

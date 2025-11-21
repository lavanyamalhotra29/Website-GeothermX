import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/contactFormDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error(err));

// ✅ Schema + Model
const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  message: String,
});


const Contact = mongoose.model("Contact", contactSchema);

// Nodemailer transporter

import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

// API endpoint
app.post("/contact", async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // 1️⃣ Save to MongoDB
    const newContact = new Contact({ firstName, lastName, email, message });
    await newContact.save();

    // 2️⃣ Send email to the user
    await resend.emails.send({
    from: "GeoThermX <onboarding@resend.dev>",
    to: "info.geothermx@gmail.com",
    subject: `their email : ${email}`,
      text: `message from them :  \n\n"${message}"\n\n `,
    });

    res.status(200).json({ success: true, message: "Message saved & email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to save message or send email" });
  }
});

//  Start server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));

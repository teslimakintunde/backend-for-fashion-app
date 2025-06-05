const Note = require("../models/Note");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

//get all notes
// const getAllNotes = asyncHandler(async (req, res) => {
//   const allNotes = await Note.find().lean();

//   if (!allNotes?.length)
//     return res.status(400).json({ message: "No note is found" });
//   res.json(allNotes);

//   //get note with all users
//   // const noteWithUser = await Promise.all(
//   //   allNotes.map(async (note) => {
//   //     const user = await User.findById(note.user).lean().exec();
//   //     return { ...note, username: user?.username || "Unknown" };
//   //   })
//   // );
//   const notesWithUsernames = await Promise.all(
//     allNotes.map(async (note) => {
//       const user = await User.findById(note.user).lean().exec();

//       // Create a new object with all note properties EXCEPT 'user'
//       // and ADD the 'username' field
//       const { user: _, ...noteWithoutUser } = note; // Remove user field
//       return {
//         ...noteWithoutUser,
//         username: user?.username || "Unknown", // Add username
//       };
//     })
//   );
//   res.json(notesWithUsernames);
// });

const getAllNotes = asyncHandler(async (req, res) => {
  try {
    const allNotes = await Note.find().lean();

    if (!allNotes?.length) {
      return res.status(404).json({ message: "No notes found" });
    }

    const notesWithUsernames = await Promise.all(
      allNotes.map(async (note) => {
        try {
          const user = await User.findById(note.user).lean().exec();
          // Create new object without user ID
          const { user: _, ...noteData } = note;
          return {
            ...noteData,
            username: user?.username || "Unknown",
          };
        } catch (error) {
          // If user lookup fails, still return note without username
          const { user: _, ...noteData } = note;
          return {
            ...noteData,
            username: "Error loading user",
          };
        }
      })
    );

    res.json(notesWithUsernames);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//create new note
const createNewNote = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  if (!user || !title || !text)
    return res.status(400).json({ message: "All fields are required" });

  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate)
    return res.status(409).json({ message: "duplicate note title" });

  const newUser = await Note.create({ user, title, text });

  if (newUser) {
    res.status(201).json({ message: "New user created" });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
});

// update note
const updateNote = async (req, res) => {
  const { id, user, title, text, completed } = req.body;
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All the fields are required" });
  }
  const note = await Note.findById(id).exec();
  if (!note) return res.status(400).json({ message: "note not found" });

  const duplicate = await Note.findOne({ title }).lean().exec();
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;
  const updatedNote = await note.save();
  if (updatedNote) {
    res.status(200).json({ message: "Note updated successfully" });
  } else {
    res.status(400).json({ message: "invalid data" });
  }
};

//delete note
const deleteNote = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Invalid id" });

  const note = await Note.findById(id).exec();
  if (!note) return res.status(400).json({ message: "Note not found" });

  const result = await note.deleteOne();
  const reply = `Note '${result.title}' with ID ${result._id} deleted`;
  if (result) {
    res.status(200).json({ message: "Note successfully deleted" });
  } else {
    res.status(400).json({ message: "Invalid data" });
  }
};

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };

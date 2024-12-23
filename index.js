const mainBtn = document.getElementById("submit");

const callApi = async (url, method, data = null) => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : null,
  });

  if (!response.ok) {
    console.log("ERROR");
  }

  return await response.json();
};

class Notes {
  constructor(title = "", content = "", date = "", isImportant = false) {
    this.title = title;
    this.content = content;
    this.date = date;
    this.isImportant = isImportant;
  }

  async createNote() {
    const data = {
      title: this.title,
      content: this.content,
      date: this.date,
      isImportant: this.isImportant,
    };

    const res = await callApi("http://localhost:8000/notes", "POST", data);

    if (res) {
      console.log("Note created:", res);
      this.renderNoteCard(res);
    }
  }

  async getAllNotes() {
    const notes = await callApi("http://localhost:8000/notes", "GET");
    const notesContainer = document.getElementById("notes");
    notesContainer.innerHTML = "";

    notes.forEach((note) => this.renderNoteCard(note));
  }

  renderNoteCard(note) {
    const notesContainer = document.getElementById("notes");

    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    noteCard.id = `note-${note.id}`;
    noteCard.innerHTML = `
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <p class="note-date">Date: ${note.date}</p>
      ${note.isImportant ? '<span class="note-important">Important</span>' : ""}
      <div class="btns">
        <button class="btn-update" data-id="${note.id}">Update</button>
        <button class="btn-delete" data-id="${note.id}">Delete</button>
      </div>
    `;

    notesContainer.appendChild(noteCard);
  }

  async getsingleNote(id) {
    const response = await callApi(
      `http://localhost:8000/notes?id=${id}`,
      "GET"
    );
    window.location.href = `./singlepage.html?id=${id}`;
  }

  async deleteNote(id) {
    await callApi(`http://localhost:8000/notes/${id}`, "DELETE");
    document.getElementById(`note-${id}`).remove();
    alert("Deleted Successfully");
  }
}

// For create or add new note
document.querySelector("form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const date = document.getElementById("date").value;
  const isImp = document.getElementById("important").checked;

  const note = new Notes(title, content, date, isImp);
  await note.createNote();

  // Clear form inputs
  document.getElementById("title").value = "";
  document.getElementById("content").value = "";
  document.getElementById("date").value = "";
  document.getElementById("important").checked = false;
});

// Fetch and Display All Notes
const noteInstance = new Notes();
const getdata = async () => {
  await noteInstance.getAllNotes();
};
getdata();

// Event Delegation for Update and Delete
document.getElementById("notes").addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("btn-update")) {
    const id = target.dataset.id;
    console.log(id);
    console.log(event);

    await updateNoteHandler(id);
  } else if (target.classList.contains("btn-delete")) {
    const id = target.dataset.id;
    console.log(id);
    console.log(target);

    await noteInstance.deleteNote(id);
  }
});

// Update Note Handler
const updateNoteHandler = async (id) => {
  //get data to add inputs feild ## should i send it from my div will be better
  const response = await callApi(`http://localhost:8000/notes?id=${id}`, "GET");

  document.getElementById("title").value = response[0].title;
  document.getElementById("content").value = response[0].content;
  document.getElementById("date").value = response[0].date;
  mainBtn.textContent = "Update Note";
  mainBtn.classList.add("updateBtn");
  scrollTo(0, 0,);

  mainBtn.onclick = async () => {
    const updatedData = {
      title: document.getElementById("title").value,
      content: document.getElementById("content").value,
      date: document.getElementById("date").value,
      isImportant: document.getElementById("important").checked,
    };

    await callApi(`http://localhost:8000/notes/${id}`, "PUT", updatedData);
    alert("Note Updated Successfully");
    //back to normal
    mainBtn.textContent = "Submit";
    mainBtn.classList.remove("updateBtn");
    getdata();
  };
};

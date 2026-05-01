var tripForm = document.getElementById("tripForm");
var tripId = document.getElementById("tripId");
var destination = document.getElementById("destination");
var startDate = document.getElementById("startDate");
var endDate = document.getElementById("endDate");
var budget = document.getElementById("budget");
var travelType = document.getElementById("travelType");
var notes = document.getElementById("notes");
var formMessage = document.getElementById("formMessage");
var saveButton = document.getElementById("saveButton");

var tripList = document.getElementById("tripList");
var tripEmptyMessage = document.getElementById("tripEmptyMessage");
var aboutButton = document.getElementById("aboutButton");
var aboutCard = document.getElementById("aboutCard");

var checklistInput = document.getElementById("checklistInput");
var addChecklistButton = document.getElementById("addChecklistButton");
var checklistItems = document.getElementById("checklistItems");
var checklistEmptyMessage = document.getElementById("checklistEmptyMessage");
var checklistProgress = document.getElementById("checklistProgress");
var checklistTripLabel = document.getElementById("checklistTripLabel");

var trips = JSON.parse(localStorage.getItem("trips")) || [];
var packingLists = JSON.parse(localStorage.getItem("packingLists")) || {};
var selectedTripId = localStorage.getItem("selectedTripId") || "";

if (trips.length > 0 && !selectedTripId) {
  selectedTripId = trips[0].id;
}

showTrips(trips);
showChecklist();

tripForm.addEventListener("submit", saveTrip);
addChecklistButton.addEventListener("click", addChecklistItem);
aboutButton.addEventListener("click", function () {
  aboutCard.classList.toggle("open");
});

function saveData() {
  localStorage.setItem("trips", JSON.stringify(trips));
  localStorage.setItem("packingLists", JSON.stringify(packingLists));
  localStorage.setItem("selectedTripId", selectedTripId);
}

function saveTrip(e) {
  e.preventDefault();

  if (
    destination.value.trim() === "" ||
    startDate.value === "" ||
    endDate.value === "" ||
    budget.value === ""
  ) {
    formMessage.textContent = "Please fill all required fields.";
    return;
  }

  if (endDate.value < startDate.value) {
    formMessage.textContent = "End date cannot be before start date.";
    return;
  }

  if (tripId.value === "") {
    var newId = Date.now().toString();

    trips.push({
      id: newId,
      destination: destination.value.trim(),
      startDate: startDate.value,
      endDate: endDate.value,
      budget: budget.value,
      travelType: travelType.value,
      notes: notes.value.trim()
    });

    packingLists[newId] = [];
    selectedTripId = newId;
    formMessage.textContent = "Trip saved successfully.";
  } else {
    for (var i = 0; i < trips.length; i++) {
      if (trips[i].id === tripId.value) {
        trips[i].destination = destination.value.trim();
        trips[i].startDate = startDate.value;
        trips[i].endDate = endDate.value;
        trips[i].budget = budget.value;
        trips[i].travelType = travelType.value;
        trips[i].notes = notes.value.trim();
      }
    }

    formMessage.textContent = "Trip updated successfully.";
    saveButton.textContent = "Save Trip";
  }

  saveData();
  showTrips(trips);
  showChecklist();
  tripForm.reset();
  tripId.value = "";
}

function showTrips(list) {
  tripList.innerHTML = "";

  if (list.length === 0) {
    tripEmptyMessage.classList.remove("hidden");
    return;
  }

  tripEmptyMessage.classList.add("hidden");

  for (var i = 0; i < list.length; i++) {
    var trip = list[i];
    var buttonText = trip.id === selectedTripId ? "Selected" : "Select Trip";

    var card = document.createElement("div");
    card.className = "trip-card";
    card.innerHTML =
      "<span class='trip-status'>Upcoming Trip</span>" +
      "<h3>" + trip.destination + "</h3>" +
      "<p><strong>Dates:</strong> " + formatDate(trip.startDate) + " to " + formatDate(trip.endDate) + "</p>" +
      "<p><strong>Budget:</strong> Rs. " + trip.budget + "</p>" +
      "<p><strong>Travel Type:</strong> " + trip.travelType + "</p>" +
      "<p><strong>Notes:</strong> " + trip.notes + "</p>" +
      "<div class='card-buttons'>" +
      "<button class='secondary-btn' onclick='selectTrip(\"" + trip.id + "\")'>" + buttonText + "</button>" +
      "<button class='secondary-btn' onclick='editTrip(\"" + trip.id + "\")'>Edit</button>" +
      "<button class='primary-btn' onclick='deleteTrip(\"" + trip.id + "\")'>Delete</button>" +
      "</div>";

    tripList.appendChild(card);
  }
}

function editTrip(id) {
  for (var i = 0; i < trips.length; i++) {
    if (trips[i].id === id) {
      tripId.value = trips[i].id;
      destination.value = trips[i].destination;
      startDate.value = trips[i].startDate;
      endDate.value = trips[i].endDate;
      budget.value = trips[i].budget;
      travelType.value = trips[i].travelType;
      notes.value = trips[i].notes;
      saveButton.textContent = "Update Trip";
      formMessage.textContent = "You are editing this trip.";
    }
  }
}

function deleteTrip(id) {
  if (!confirm("Are you sure you want to delete this trip?")) {
    return;
  }

  trips = trips.filter(function (trip) {
    return trip.id !== id;
  });

  delete packingLists[id];

  if (selectedTripId === id) {
    selectedTripId = trips.length > 0 ? trips[0].id : "";
  }

  saveData();
  showTrips(trips);
  showChecklist();
}

function selectTrip(id) {
  selectedTripId = id;

  if (!packingLists[id]) {
    packingLists[id] = [];
  }

  saveData();
  showTrips(trips);
  showChecklist();
}

function showChecklist() {
  checklistItems.innerHTML = "";

  if (selectedTripId === "") {
    checklistTripLabel.textContent = "Select a trip to manage its packing checklist.";
    checklistProgress.textContent = "0 of 0 items packed";
    checklistEmptyMessage.textContent = "Choose a trip first, then add packing items.";
    checklistEmptyMessage.classList.remove("hidden");
    return;
  }

  var currentTrip = trips.find(function (trip) {
    return trip.id === selectedTripId;
  });

  var list = packingLists[selectedTripId] || [];
  var doneCount = 0;

  checklistTripLabel.textContent = "Checklist for " + currentTrip.destination;

  for (var i = 0; i < list.length; i++) {
    if (list[i].done) {
      doneCount++;
    }
  }

  checklistProgress.textContent = doneCount + " of " + list.length + " items packed";

  if (list.length === 0) {
    checklistEmptyMessage.textContent = "No packing items yet for this trip.";
    checklistEmptyMessage.classList.remove("hidden");
  } else {
    checklistEmptyMessage.classList.add("hidden");
  }

  for (var j = 0; j < list.length; j++) {
    var item = list[j];
    var row = document.createElement("div");
    row.className = "checklist-item";

    row.innerHTML =
      "<div class='checklist-left'>" +
      "<input type='checkbox' " + (item.done ? "checked" : "") + " onchange='toggleChecklistItem(\"" + item.id + "\")'>" +
      "<span class='" + (item.done ? "done-text" : "") + "'>" + item.name + "</span>" +
      "</div>" +
      "<button class='secondary-btn' onclick='deleteChecklistItem(\"" + item.id + "\")'>Delete</button>";

    checklistItems.appendChild(row);
  }
}

function addChecklistItem() {
  if (selectedTripId === "") {
    return;
  }

  if (checklistInput.value.trim() === "") {
    return;
  }

  packingLists[selectedTripId].push({
    id: Date.now().toString(),
    name: checklistInput.value.trim(),
    done: false
  });

  checklistInput.value = "";
  saveData();
  showChecklist();
}

function toggleChecklistItem(id) {
  var list = packingLists[selectedTripId];

  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      list[i].done = !list[i].done;
    }
  }

  saveData();
  showChecklist();
}

function deleteChecklistItem(id) {
  packingLists[selectedTripId] = packingLists[selectedTripId].filter(function (item) {
    return item.id !== id;
  });

  saveData();
  showChecklist();
}

function formatDate(dateText) {
  var date = new Date(dateText);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

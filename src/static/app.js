document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Clear activity select options except placeholder
      Array.from(activitySelect.options).slice(1).forEach(o => o.remove());

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const participantsArr = Array.isArray(details.participants) ? details.participants : [];
        const spotsLeft = details.max_participants - participantsArr.length;

        // Basic card content
        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p class="description">${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section (bulleted list)
        const participantsWrap = document.createElement("div");
        participantsWrap.className = "participants";

        const count = participantsArr.length;
        const heading = document.createElement("h5");
        heading.textContent = `Participants (${count})`;
        participantsWrap.appendChild(heading);

        if (count === 0) {
          const empty = document.createElement("p");
          empty.className = "empty";
          empty.textContent = "No participants yet";
          participantsWrap.appendChild(empty);
        } else {
          const ul = document.createElement("ul");
          participantsArr.forEach((p) => {
            const li = document.createElement("li");
            li.textContent = p;
            ul.appendChild(li);
          });
          participantsWrap.appendChild(ul);
        }

        activityCard.appendChild(participantsWrap);
        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});

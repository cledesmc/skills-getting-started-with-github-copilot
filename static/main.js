"""
High School Management System API

A super simple FastAPI application that allows students to view and sign up
for extracurricular activities at Mergington High School.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
import os
from pathlib import Path

app = FastAPI(title="Mergington High School API",
              description="API for viewing and signing up for extracurricular activities")

# Mount the static files directory
current_dir = Path(__file__).parent
app.mount("/static", StaticFiles(directory=os.path.join(Path(__file__).parent,
          "static")), name="static")

# In-memory activity database
activities = {
    "Chess Club": {
        "description": "Learn strategies and compete in chess tournaments",
        "schedule": "Fridays, 3:30 PM - 5:00 PM",
        "max_participants": 12,
        "participants": ["michael@mergington.edu", "daniel@mergington.edu"]
    },
    "Programming Class": {
        "description": "Learn programming fundamentals and build software projects",
        "schedule": "Tuesdays and Thursdays, 3:30 PM - 4:30 PM",
        "max_participants": 20,
        "participants": ["emma@mergington.edu", "sophia@mergington.edu"]
    },
    "Gym Class": {
        "description": "Physical education and sports activities",
        "schedule": "Mondays, Wednesdays, Fridays, 2:00 PM - 3:00 PM",
        "max_participants": 30,
        "participants": ["john@mergington.edu", "olivia@mergington.edu"]
    },
    "Soccer Team": {
        "description": "Join the school soccer team and compete in matches",
        "schedule": "Tuesdays and Thursdays, 4:00 PM - 5:30 PM",
        "max_participants": 25,
        "participants": ["liam@mergington.edu", "noah@mergington.edu"]
    },
    "Basketball Team": {
        "description": "Practice basketball skills and play in tournaments",
        "schedule": "Wednesdays, 3:30 PM - 5:00 PM",
        "max_participants": 20,
        "participants": ["ava@mergington.edu", "mia@mergington.edu"]
    },
    "Art Club": {
        "description": "Explore various art techniques and create your own masterpieces",
        "schedule": "Thursdays, 3:30 PM - 5:00 PM",
        "max_participants": 15,
        "participants": ["amelia@mergington.edu", "harper@mergington.edu"]
    },
    "Drama Club": {
        "description": "Participate in plays and improve acting skills",
        "schedule": "Mondays, 3:30 PM - 5:00 PM",
        "max_participants": 18,
        "participants": ["ella@mergington.edu", "scarlett@mergington.edu"]
    },
    "Math Club": {
        "description": "Solve challenging math problems and prepare for competitions",
        "schedule": "Fridays, 3:30 PM - 4:30 PM",
        "max_participants": 10,
        "participants": ["james@mergington.edu", "benjamin@mergington.edu"]
    },
    "Science Club": {
        "description": "Conduct experiments and explore scientific concepts",
        "schedule": "Wednesdays, 3:30 PM - 4:30 PM",
        "max_participants": 12,
        "participants": ["charlotte@mergington.edu", "henry@mergington.edu"]
    }
}


@app.get("/")
def root():
    return RedirectResponse(url="/static/index.html")


@app.get("/activities")
def get_activities():
    return activities


@app.post("/activities/{activity_name}/signup")
def signup_for_activity(activity_name: str, email: str):
    """Sign up a student for an activity"""
    # Validate activity exists
    if activity_name not in activities:
        raise HTTPException(status_code=404, detail="Activity not found")

    # Get the specific activity
    activity = activities[activity_name]
    # Validate student is not already signed up
    if email in activity["participants"]:
        raise HTTPException(status_code=400, detail="Student already signed up for this activity")
    # Add student
    activity["participants"].append(email)
    return {"message": f"Signed up {email} for {activity_name}"}


"""
Main JavaScript for Mergington High School API

This script fetches activities from the API, creates cards for each activity,
and displays the participant list as bullet points. It includes a counter and
text when there are no participants.
"""

(function(){
  function el(tag, attrs = {}, ...children){
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v])=>{
      if(k === 'class') node.className = v;
      else if(k === 'html') node.innerHTML = v;
      else node.setAttribute(k, v);
    });
    children.flat().forEach(c => {
      if (c == null) return;
      node.append(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function safeId(name){
    return 'act-' + name.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-_]/g,'');
  }

  function participantSection(participants){
    const wrap = el('div', {class:'participants'});
    wrap.append(el('h4', {}, `Participantes (${participants.length})`));
    if(!participants || participants.length === 0){
      wrap.append(el('div', {class:'empty'}, 'Aún no hay participantes'));
      return wrap;
    }
    const ul = el('ul');
    participants.forEach(p => {
      ul.appendChild(el('li', {}, p));
    });
    wrap.appendChild(ul);
    return wrap;
  }

  async function loadActivities(){
    const container = document.getElementById('activities');
    if(!container) return;
    try{
      const res = await fetch('/activities');
      if(!res.ok) throw new Error('Failed to load activities');
      const data = await res.json();

      Object.entries(data).forEach(([name, info]) => {
        const id = safeId(name);
        const card = el('article', {class:'card', role:'article', 'aria-labelledby': id});
        const title = el('h3', {id}, name);
        const meta = el('div', {class:'meta'}, info.schedule || 'Horario no disponible');
        const desc = el('div', {class:'description'}, info.description || '');
        const actions = el('div', {class:'actions'},
          el('div', {}, el('strong', {}, `Máx: ${info.max_participants || '—'}`)),
          el('button', {class:'signup-btn', type:'button', onclick: `alert('Usa la API para inscribir estudiantes')`}, 'Inscribirse')
        );

        card.append(title, meta, desc, actions, participantSection(info.participants || []));
        container.appendChild(card);
      });
    }catch(e){
      container.appendChild(el('div', {class:'empty'}, 'Error al cargar actividades.'));
      console.error(e);
    }
  }

  document.addEventListener('DOMContentLoaded', loadActivities);
})();
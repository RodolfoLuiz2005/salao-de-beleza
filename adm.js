document.addEventListener("DOMContentLoaded", () => {

  /* LOGIN */

  const loginScreen = document.getElementById("loginScreen");
  const loginBtn = document.getElementById("loginBtn");
  const adminPassword = document.getElementById("adminPassword");
  const loginError = document.getElementById("loginError");

  const ADMIN_PASSWORD = "12345";

  loginBtn.addEventListener("click", () => {

    if(adminPassword.value === ADMIN_PASSWORD){
      loginScreen.style.display = "none";
    } else {
      loginError.textContent = "Senha incorreta";
    }

  });

  /* ELEMENTOS */

  const appointmentsGrid = document.getElementById("appointmentsGrid");
  const clearBtn = document.getElementById("clearBtn");

  const totalAppointments = document.getElementById("totalAppointments");
  const completedAppointments = document.getElementById("completedAppointments");
  const totalRevenue = document.getElementById("totalRevenue");

  /* PREÇOS DOS SERVIÇOS */

  const servicePrices = {
    "Corte": 50,
    "Escova": 80,
    "Hidratação": 120,
    "Manicure": 40,
    "Pedicure": 45,
    "Progressiva": 250,
    "Coloração": 180
  };

  function calculateRevenue(services){

    let total = 0;

    services.forEach(service => {
      total += servicePrices[service] || 0;
    });

    return total;

  }

  function renderAppointments() {

    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];

    appointmentsGrid.innerHTML = "";

    if (appointments.length === 0) {

      appointmentsGrid.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-calendar-x" style="font-size: 3rem;"></i>
          <h2>Nenhum agendamento encontrado</h2>
        </div>
      `;

      return;
    }

    let totalRevenueValue = 0;
    let completedCount = 0;

    appointments.reverse().forEach((app, index) => {

      if(!app.status){
        app.status = "pendente";
      }

      const card = document.createElement("div");
      card.className = "appointment-card";

      const revenue = calculateRevenue(app.services);

      if(app.status === "concluido"){
        totalRevenueValue += revenue;
        completedCount++;
      }

      const servicesHtml = app.services
        .map(service => `
          <span class="service-tag">
            ${service}
            - R$ ${servicePrices[service] || 0}
          </span>
        `).join("");

      const schedulesHtml = app.schedules.map(sch => `
        <div class="schedule-item">
          <i class="bi bi-clock-history"></i>

          <div class="schedule-details">
            <strong>${sch.day}</strong>
            <span>${sch.time} - ${sch.service}</span>
          </div>
        </div>
      `).join("");

      let currentStatusHtml = "";

      if(app.status === "concluido"){
        currentStatusHtml = `
          <div class="current-status status-completed">
            ✅ Serviço concluído
          </div>
        `;
      }

      if(app.status === "faltou"){
        currentStatusHtml = `
          <div class="current-status status-missed">
            ❌ Cliente não compareceu
          </div>
        `;
      }

      card.innerHTML = `

        <div class="card-header">

          <div class="client-info">
            <h3>
              <i class="bi bi-person-circle"></i>
              ${app.name}
            </h3>

            <p>
              <i class="bi bi-telephone"></i>
              ${app.phone}
            </p>
          </div>

        </div>

        <div class="card-body">

          <h4>Serviços</h4>

          <div class="services-list">
            ${servicesHtml}
          </div>

          <h4>Horários</h4>

          <div class="schedules-list">
            ${schedulesHtml}
          </div>

          <h4 style="margin-top:1rem;">
            Valor estimado:
            R$ ${revenue}
          </h4>

          ${currentStatusHtml}

          <div class="status-actions">

            <button class="status-btn btn-complete" data-index="${index}">
              ✅ Concluir
            </button>

            <button class="status-btn btn-missed" data-index="${index}">
              ❌ Não compareceu
            </button>

          </div>

        </div>

      `;

      appointmentsGrid.appendChild(card);

    });

    totalAppointments.textContent = appointments.length;
    completedAppointments.textContent = completedCount;
    totalRevenue.textContent = `R$ ${totalRevenueValue}`;

    saveUpdatedAppointments(appointments);

    addStatusEvents(appointments);

  }

  function saveUpdatedAppointments(appointments){
    localStorage.setItem("appointments", JSON.stringify(appointments.reverse()));
  }

  function addStatusEvents(appointments){

    const completeButtons = document.querySelectorAll(".btn-complete");
    const missedButtons = document.querySelectorAll(".btn-missed");

    completeButtons.forEach(btn => {

      btn.addEventListener("click", () => {

        const index = btn.dataset.index;

        appointments[index].status = "concluido";

        localStorage.setItem("appointments", JSON.stringify(appointments.reverse()));

        renderAppointments();

      });

    });

    missedButtons.forEach(btn => {

      btn.addEventListener("click", () => {

        const index = btn.dataset.index;

        appointments[index].status = "faltou";

        localStorage.setItem("appointments", JSON.stringify(appointments.reverse()));

        renderAppointments();

      });

    });

  }

  clearBtn.addEventListener("click", () => {

    if(confirm("Deseja apagar todos os agendamentos?")){

      localStorage.removeItem("appointments");

      renderAppointments();

    }

  });

  renderAppointments();

});

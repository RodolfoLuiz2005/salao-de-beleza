const form = document.getElementById("bookingForm");
const daySelect = document.getElementById("day");
const timeSlots = document.getElementById("timeSlots");
const timeInput = document.getElementById("time");
const slots = timeSlots.querySelectorAll(".slot");
const serviceCheckboxes = document.querySelectorAll('input[name="services"]');
const dayPreference = document.getElementById("dayPreference");
const agendaGrid = document.getElementById("agendaGrid");
const scheduleRadios = document.querySelectorAll('input[name="scheduleType"]');
const singleDaySchedule = document.getElementById("singleDaySchedule");
const separateDaysSchedule = document.getElementById("separateDaysSchedule");

// Função para destacar o horário na agenda
function updateAgendaHighlight() {
  document.querySelectorAll(".schedule-row .hours span.highlighted").forEach(s => s.classList.remove("highlighted"));
  
  if (singleDaySchedule.style.display !== "none" && daySelect.value && timeInput.value) {
    const row = agendaGrid.querySelector(`.schedule-row[data-day="${daySelect.value}"]`);
    if (row) {
      const slot = row.querySelector(`.hours span[data-time="${timeInput.value}"]`);
      if (slot) {
        slot.classList.add("highlighted");
      }
    }
  }
}

// Atualiza a visualização baseada nas preferências (mesmo dia vs dias separados)
function updateScheduleView() {
  const checkedServices = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);
  
  if (checkedServices.length > 1) {
    dayPreference.style.display = "block";
  } else {
    dayPreference.style.display = "none";
    document.querySelector('input[name="scheduleType"][value="Mesmo dia"]').checked = true;
  }

  const isSeparate = document.querySelector('input[name="scheduleType"]:checked').value === "Dias separados" && checkedServices.length > 1;

  if (isSeparate) {
    singleDaySchedule.style.display = "none";
    separateDaysSchedule.style.display = "block";
    renderSeparateSchedules(checkedServices);
  } else {
    singleDaySchedule.style.display = "block";
    separateDaysSchedule.style.display = "none";
    separateDaysSchedule.innerHTML = "";
  }
  updateAgendaHighlight();
}

// Cria os campos de dia/horário para cada serviço selecionado individualmente
function renderSeparateSchedules(services) {
  separateDaysSchedule.innerHTML = "";
  
  services.forEach(service => {
    const row = document.createElement("div");
    row.className = "service-schedule-row";
    
    const daysHtml = `
      <option value="">Selecione o dia</option>
      <option value="Segunda-feira">Segunda-feira</option>
      <option value="Terça-feira">Terça-feira</option>
      <option value="Quarta-feira">Quarta-feira</option>
      <option value="Quinta-feira">Quinta-feira</option>
      <option value="Sexta-feira">Sexta-feira</option>
      <option value="Sábado">Sábado (até 12h)</option>
    `;

    const timesHtml = `
      <option value="">Selecione o horário</option>
      <option value="08:00">08:00</option>
      <option value="09:00">09:00</option>
      <option value="10:00">10:00</option>
      <option value="11:00">11:00</option>
      <option value="13:00" class="weekday-only">13:00</option>
      <option value="14:00" class="weekday-only">14:00</option>
      <option value="15:00" class="weekday-only">15:00</option>
      <option value="16:00" class="weekday-only">16:00</option>
      <option value="17:00" class="weekday-only">17:00</option>
    `;

    row.innerHTML = `
      <strong>${service}</strong>
      <div class="service-schedule-inputs">
        <select class="sep-day" required>${daysHtml}</select>
        <select class="sep-time" required>${timesHtml}</select>
      </div>
    `;

    const sepDaySelect = row.querySelector('.sep-day');
    const sepTimeSelect = row.querySelector('.sep-time');

    // Lógica para esconder horários da tarde aos Sábados
    sepDaySelect.addEventListener('change', function() {
      const isSat = this.value === "Sábado";
      Array.from(sepTimeSelect.options).forEach(opt => {
        if (opt.classList.contains('weekday-only')) {
          opt.style.display = isSat ? "none" : "";
        }
      });
      if (isSat && sepTimeSelect.value && parseInt(sepTimeSelect.value) >= 12) {
        sepTimeSelect.value = "";
      }
    });

    separateDaysSchedule.appendChild(row);
  });
}

// Eventos de alteração
serviceCheckboxes.forEach(cb => {
  cb.addEventListener("change", updateScheduleView);
});

scheduleRadios.forEach(radio => {
  radio.addEventListener("change", updateScheduleView);
});

daySelect.addEventListener("change", function () {
  const isSaturday = this.value === "Sábado";

  slots.forEach(slot => slot.classList.remove("selected"));
  timeInput.value = "";
  updateAgendaHighlight();

  slots.forEach(slot => {
    if (slot.classList.contains("weekday-only")) {
      slot.style.display = isSaturday ? "none" : "";
    }
    slot.style.pointerEvents = "";
    slot.classList.remove("disabled");
  });

  if (!this.value) {
    slots.forEach(slot => {
      slot.style.pointerEvents = "none";
      slot.classList.add("disabled");
    });
  }
});

timeSlots.addEventListener("click", function (e) {
  const slot = e.target.closest(".slot");
  if (!slot || slot.classList.contains("disabled")) return;
  if (!daySelect.value) {
    alert("Selecione o dia da semana primeiro!");
    return;
  }

  slots.forEach(s => s.classList.remove("selected"));
  slot.classList.add("selected");
  timeInput.value = slot.dataset.time;
  updateAgendaHighlight();
});

slots.forEach(slot => {
  slot.style.pointerEvents = "none";
  slot.classList.add("disabled");
});

// Submit
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const checkedServices = Array.from(document.querySelectorAll('input[name="services"]:checked')).map(cb => cb.value);

  if (checkedServices.length === 0) {
    alert("Por favor, selecione pelo menos um serviço!");
    return;
  }

  const isSeparate = document.querySelector('input[name="scheduleType"]:checked').value === "Dias separados" && checkedServices.length > 1;
  let scheduleDetails = "";

  if (isSeparate) {
    const rows = separateDaysSchedule.querySelectorAll('.service-schedule-row');
    let allFilled = true;
    
    rows.forEach(row => {
      const serviceName = row.querySelector('strong').innerText;
      const day = row.querySelector('.sep-day').value;
      const time = row.querySelector('.sep-time').value;
      
      if (!day || !time) {
        allFilled = false;
      } else {
        scheduleDetails += `- ${serviceName}: ${day} às ${time}\n`;
      }
    });

    if (!allFilled) {
      alert("Por favor, preencha o dia e o horário para todos os serviços selecionados.");
      return;
    }
  } else {
    const day = daySelect.value;
    const time = timeInput.value;

    if (!day || !time) {
      alert("Por favor, selecione um dia e um horário!");
      return;
    }
    scheduleDetails = `Todos os serviços em ${day} às ${time}\n`;
  }

  alert(
    `Agendamento confirmado!\n\n` +
    `Cliente: ${name}\n` +
    `Telefone: ${phone}\n` +
    `Serviços: ${checkedServices.join(", ")}\n\n` +
    `Detalhes dos horários:\n` +
    scheduleDetails
  );

  form.reset();
  slots.forEach(slot => {
    slot.classList.remove("selected");
    slot.style.pointerEvents = "none";
    slot.classList.add("disabled");
  });
  timeInput.value = "";
  updateAgendaHighlight();
  updateScheduleView();
});
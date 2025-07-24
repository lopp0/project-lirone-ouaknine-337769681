console.log("script.js loaded!");

document.addEventListener('DOMContentLoaded', function() {
  const storagekey = 'faultReports';

  function loadItems() {
    return JSON.parse(localStorage.getItem(storagekey) || '[]');
  }

  function saveItem(item) {
    const faultsArr = loadItems();
    faultsArr.push(item);
    localStorage.setItem(storagekey, JSON.stringify(faultsArr));
  }

  function deleteItem(id) {
    let arr = loadItems();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        arr.splice(i, 1);
        break;
      }
    }
    localStorage.setItem(storagekey, JSON.stringify(arr));
    renderItems();
  }

  function updateItem(id, changes) {
    let arr = loadItems();
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].id == id) {
        for (let key in changes) {
          arr[i][key] = changes[key];
        }
        break;
      }
    }
    localStorage.setItem(storagekey, JSON.stringify(arr));
    renderItems();
  }

  function renderItems(filterStatus) {
    const container = document.getElementById('faultsList');
    let faults = loadItems();
    
    if (!container) return; 

    let filteredFaults = [];
    if (filterStatus === 'פתוחה') {
    for (let i = 0; i < faults.length; i++) {
    if (faults[i].status === 'פתוחה') {
      filteredFaults.push(faults[i]);
    }
  }
    faults = filteredFaults;
    } else if (filterStatus === 'טופלה') {
    for (let i = 0; i < faults.length; i++) {
    if (faults[i].status === 'טופלה') {
      filteredFaults.push(faults[i]);
    }
  }
  faults = filteredFaults;
}
    
    if (!faults.length) {
      container.innerHTML = '<p>לא נמצאו דיווחים.</p>';
      return;
    }
    
    let html = '';
    for (let i = 0; i < faults.length; i++) {
      let fault = faults[i];
      html += `
        <div class="fault-card">
          <h2>דיווח תעלה ${fault.channelNumber}</h2>
          <p><strong>זמן יעד:</strong> ${fault.scheduledTime}</p>
          <p><strong>זמן בפועל:</strong> ${fault.actualTime}</p>
          <p><strong>תיאור:</strong> ${fault.faultDescription}</p>
          <p><strong>האם יותר מאדם אחד חצה ? :</strong> ${fault.crossedMultiple ? 'כן' : 'לא'}</p>
          <p><strong>האם קיים סכנת אבטחה ? :</strong> ${fault.securityPresent ? 'כן' : 'לא'}</p>
          <p><strong>מייל המדווח:</strong> ${fault.reporterEmail}</p>
          <p><strong>סטטוס:</strong> <span class="status-label">${fault.status || 'פתוחה'}</span></p>
          <button class="delete-btn" data-id="${fault.id}">מחק</button>
          <button class="status-btn" data-id="${fault.id}">
            ${fault.status === 'טופלה' ? 'סמן כפתוחה' : 'סמן כטופלה'}
          </button>
        </div>
      `;
    }
    container.innerHTML = html;

    let deleteBtns = document.getElementsByClassName('delete-btn');
    for (let i = 0; i < deleteBtns.length; i++) {
      deleteBtns[i].onclick = function(event) {
        console.log("Delete button clicked", event.currentTarget.getAttribute('data-id'));
        deleteItem(event.currentTarget.getAttribute('data-id'));
      };
    }

    let statusBtns = document.getElementsByClassName('status-btn');
    for (let i = 0; i < statusBtns.length; i++) {
      statusBtns[i].onclick = function(event) {
        console.log("Status button clicked", event.currentTarget.getAttribute('data-id'));
        let id = event.currentTarget.getAttribute('data-id');
        let arr = loadItems();
        let newStatus = 'פתוחה';
        for (let j = 0; j < arr.length; j++) {
          if (arr[j].id == id) {
            if (arr[j].status === 'טופלה') {
              newStatus = 'פתוחה';
            } else {
              newStatus = 'טופלה';
            }
            break;
          }
        }
        updateItem(id, {status: newStatus});
      }
    }
  }

  // Logic for index.html
  const form = document.getElementById('faultForm');
  if (form) {
    const errChannelNumber = document.getElementById('errChannelNumber');
    const errScheduledTime = document.getElementById('errScheduledTime');
    const errActualTime = document.getElementById('errActualTime');
    const errFaultDescription = document.getElementById('errFaultDescription');
    const errReporterEmail = document.getElementById('errReporterEmail');
    const formSuccess = document.getElementById('formSuccess');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      errChannelNumber.textContent = '';
      errScheduledTime.textContent = '';
      errActualTime.textContent = '';
      errFaultDescription.textContent = '';
      errReporterEmail.textContent = '';
      formSuccess.textContent = '';

      let hasError = false;

      const channelInput = form.channelNumber.value.trim();
      const channelValue = Number(channelInput);

      if (
        channelInput === '' || isNaN(channelValue) ||
        channelValue < 1 || channelValue > 100
      ) {
        errChannelNumber.textContent = 'מספר תעלה חייב להיות בין 1 ל-100';
        hasError = true;
      }

      if (!form.scheduledTime.value) {
        errScheduledTime.textContent = 'אנא הזן זמן יעד';
        hasError = true;
      }

      if (!form.actualTime.value) {
        errActualTime.textContent = 'אנא הזן זמן נחיתה בפועל';
        hasError = true;
      }

      if (form.scheduledTime.value && form.actualTime.value) {
        if (form.actualTime.value < form.scheduledTime.value) {
          errActualTime.textContent = 'זמן הנחיתה לא יכול להיות לפני זמן היעד';
          hasError = true;
        }
      }

      if (!form.faultDescription.value || form.faultDescription.value.length < 10) {
        errFaultDescription.textContent = 'יש להזין תיאור תקלה (לפחות 10 תווים)';
        hasError = true;
      }

      if (!form.reporterEmail.value || !form.reporterEmail.value.includes('@')) {
        errReporterEmail.textContent = 'יש להזין אימייל תקין';
        hasError = true;
      }

      if (hasError) return;

      formSuccess.textContent = 'הדיווח נקלט בהצלחה!';
      const faultData = {
        id: Date.now(),
        channelNumber: form.channelNumber.value.trim(),
        scheduledTime: form.scheduledTime.value,
        actualTime: form.actualTime.value,
        faultDescription: form.faultDescription.value,
        crossedMultiple: form.crossedMultiple.checked,
        securityPresent: form.securityPresent.checked,
        reporterEmail: form.reporterEmail.value.trim(),
        status: 'פתוחה'
      };

      saveItem(faultData);

      form.reset();
    });
  }
  // Logic for view.html
  if (document.getElementById('faultsList')) {
    renderItems(); 

     document.getElementById('filter-all').onclick = function() {
    renderItems();
    };
    document.getElementById('filter-open').onclick = function() {
        renderItems('פתוחה');
    };
    document.getElementById('filter-close').onclick = function() {
        renderItems('טופלה');
    };
  }
});

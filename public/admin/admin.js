

// async function registerMaterial(e){
//     e.preventDefault()
  
     
//            const material=document.querySelector(".material").value
//            const price = document.querySelector(".price").value.trim()
//            const unit = document.querySelector(".amount").value.trim()

//             if(!material || !price || !unit){
//                  notify("Please fill in all fields", "error")
//                  return
//            }
           
//            console.log(material, price, unit)
//     try { 
//         const res= await fetch(`/materials`,{
//              method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({material, price, unit})
//         })
//         const data = await res.json()
//         if(res.ok){
//             notify(data.message || "Material registered successfully", "success")
//             document.getElementById("registerMaterialForm").reset()
//         } else {
//             notify(data.message || "Failed to register material", "error")
//         }
//       } catch (error) {
//         console.error(error)
//         notify("Failed to register material", "error")
//       }
//            }

// ======================== user count display =================
 

async function registerMaterial(e) {
    e.preventDefault();

    // Get the form that was actually submitted
    const form = e.target;

    // Read values using the form (safer & works for both forms)
    const material = form.querySelector(".material").value.trim();
    const amount   = form.querySelector(".amount").value.trim();
    const priceStr = form.querySelector(".price").value.trim();
    const type     = form.querySelector('#type').value
    const location  = form.querySelector(".location").value.trim();
    const quantity  = form.querySelector(".quantity").value.trim();

    // Validation
    if (!material || !amount || !priceStr || !location || !type || !quantity) {
        notify("Please fill in all required fields", "error");
        return;
    }

    const price = Number(priceStr);
    if (isNaN(price) || price <= 0) {
        notify("Please enter a valid positive price", "error");
        return;
    }

    console.log("Submitting material:", { material, amount, price ,location,type, quantity});

    try {
        const res = await fetch("/materials", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                material,
                price,       // sent as number (better for backend)
                unit: amount,
                locationName:location,
                type,
                quantity
                // using "unit" like your original code
                // If backend expects "amount" instead of "unit", change to: amount
            }), credentials: "include" // if you need to send cookies for session
        });

        const data = await res.json();

        if (res.ok) {
            notify(data.message || "Material added successfully", "success");
            displayMaterialsTable();

            // Reset the form that was submitted
            form.reset();

            // If this was the modal → close it automatically (nice UX)
            if (form.id === "registerMaterialModalForm") {
                const modalElement = document.getElementById("addMaterialModal");
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) modal.hide();
            }
        } else {
            notify(data.message || "Failed to add material", "error");
        }
    } catch (error) {
        console.error("Submit error:", error);
        notify("Network/server error — please try again", "error");
    }
}    // ============== Register Material ===============

// =============== Material Tables ==============
async function displayMaterialsTable() {
    try {
        const res = await fetch('/allMaterials');
        if (!res.ok) throw new Error('Failed to fetch materials');

        const data = await res.json();
        const materials = data.materials ;
        console.log(data)
        console.log(materials)

        const tableBody = document.getElementById('MaterialsTable');
        if (!tableBody) {
            console.error("MaterialsTable not found");
            return;
        }
    console.log()
        tableBody.innerHTML = materials.map(material => `
            <tr data-material-id="${material.id}">
                <td>${material.name || '-'}</td>
                <td>${material.quantity || '-'}</td>
                <td>${material.unit || '-'}</td>
                <td>${material.price || '-'}</td>
                <td>${material.locationName || '-'}</td>
                <td>${material.type || '-'}</td>

                <td>
                    <button class="btn btn-sm btn-warning me-1 edit-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#editMaterialModal"   <!-- change modal id if needed -->
                           <!-- data-material-id="${material.id} ">-->
                        <i class="bi bi-pencil"></i> Edit
                    </button>

                    <button class="btn btn-sm btn-danger delete-material-btn"
                            data-material-id="${material.id}"
                            title="Delete material">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        attachMaterialDeleteListeners();   // ← call the correct function

    } catch (err) {
        console.error('Failed to load materials:', err);
        // notify("Could not load materials", "error");   // if you have notify
    }
}   

// ============== Delete Material ==============
function attachMaterialDeleteListeners() {
    document.querySelectorAll('.delete-material-btn').forEach(button => {
        button.addEventListener('click', async function () {
            const materialId = this.getAttribute('data-material-id');
            const materialName = this.closest('tr').querySelector('td:first-child').textContent.trim();

            if (!confirm(`Delete material "${materialName || 'this item'}"? This cannot be undone.`)) {
                return;
            }

            try {
                const response = await fetch(`/admin/deleteMaterial/${materialId}`, {   // ← adjust endpoint if different
                    method: 'DELETE'
                
                });
                // const result = await response.json();

                const result = await response.json();

                if (response.ok && result.success) {
                    this.closest('tr').remove();
                    notify(result.message || "Material deleted", "success");
                } else {
                    notify(result.message || "Could not delete material", "error");
                }
            } catch (err) {
                console.error("Delete failed:", err);
                notify("Network error – could not delete", "error");
            }
        });
    });
}

displayAllUsers();
// ============ Display Total users ================
async function displayAllUsers() {
  try {
    const res = await fetch('/admin/api/users');
    if (!res.ok) throw new Error('Failed to fetch');

    const data = await res.json();
    console.log(data)
    const count = data.workers?.length || 0;
    document.querySelector(".totalWorkers").textContent = count;

  } catch (err) {
    console.error(err);
    document.querySelector(".totalWorkers").textContent = "—";
  }
}
document.getElementById("registerMaterialForm").addEventListener("submit", registerMaterial)
document.getElementById('registerMaterialModalForm').addEventListener('submit', registerMaterial);

// =============== user table display =================
// async function displayUsersTable() {
//     try {
//         const  res = await fetch('/allWorkers')
//             if(!res.ok) throw new Error('failed to fecth');
             
//             const data = await res.json();
//        const   tempo = data.workers
//             const workersTable = document.getElementById('WorkersTable')
//              workersTable.innerHTML= tempo.map(i =>`
//                 <tr> 
//                    <td> ${i.userName} </td>
//                    <td> ${i.Fname} </td>
//                    <td> ${i.jobPosition} </td>
//                    <td> Workers </td>
//                      <td>
//                     <button class="btn btn-sm btn-warning me-1" data-bs-toggle="modal" data-bs-target="#changePasswordModal" ">
//                         <i class="bi bi-key">edit</i>
//                     </button>
//                     <button class="btn btn-sm btn-danger" )">
//                         <i class="bi bi-trash">delete</i>
//                     </button>
//                      <button class="btn btn-sm btn-danger" ">
//                         <i class="bi bi-trash">edit</i>
//                     </button>
//                 </td>

//            </td>
//       `).join('')
             
//     } catch (error) {
//         console.error('Failed to load workers:', error);
        
//     }
    
// }
async function displayUsersTable() {
    try {
        const res = await fetch('/allWorkers');
        if (!res.ok) throw new Error('Failed to fetch workers');

        const data = await res.json();
        const workers = data.workers || []; // safe guard

        const workersTable = document.getElementById('WorkersTable');
        if (!workersTable) {
            console.error("WorkersTable element not found");
            return;
        }

        workersTable.innerHTML = workers.map(worker => `
            <tr data-worker-id="${worker.id}">
                <td>${worker.userName || '-'}</td>
                <td>${worker.Fname || '-'}</td>
                <td>${worker.jobPosition || '-'}</td>
                <td>Worker</td>
                <td>
                    <!-- Edit password button (modal) -->
                    <button class="btn btn-sm btn-warning me-1 edit-password-btn"
                            data-bs-toggle="modal"
                            data-bs-target="#changePasswordModal"
                            data-worker-id="${worker.id}">
                        <i class="bi bi-pencil"></i> Edit
                    </button>

                    <!-- Delete button -->
                    <button class="btn btn-sm btn-danger delete-worker-btn"
                            data-worker-id="${worker.id}"
                            title="Delete worker" onclick="deleteWorker(${worker.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

        // Attach delete listeners AFTER rendering
        attachDeleteListeners();

    } catch (error) {
        console.error('Failed to load workers:', error);
        // Optional: show user message
        // notify("Could not load workers list", "error");
    }
}

function attachDeleteListeners() {
    document.querySelectorAll('.delete-worker-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
            const workerId = this.getAttribute('data-worker-id');
            const workerName = this.closest('tr').querySelector('td:first-child').textContent.trim();

            // Safety confirmation
            if (!confirm(`Are you sure you want to delete worker "${workerName || 'this user'}"?`)) {
                return;
            }

            try {
                const res = await fetch('/admin/deleteWorker', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ workerId })
                });

                const result = await res.json();

                if (res.ok && result.success) {
                    // Remove row from table
                    this.closest('tr').remove();
                    notify(result.message || "Worker deleted successfully", "success");
                      displayAllUsers(); // Update worker count
                } else {
                    notify(result.message || "Failed to delete worker", "error");
                }
            } catch (err) {
                console.error("Delete failed:", err);
                notify("Network error — could not delete worker", "error");
            }
        });
    });
}

// ============== Transfer Material ==============

// async function transferMaterial() {
    
//       const materialSelect = document.getElementById('materialSelect');
//       const materialInput = document.getElementById('materialInput');
//       const amount = document.getElementById('amountT');

//       if (!materialSelect || !materialInput || !amount) {
//         console.error("Required elements not found");
//         return;
//       }

//       try {
//         const res = await fetch('/allMaterials');
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);

//         const data = await res.json();
//         const materials = data.materials || [];

//         materialSelect.innerHTML = '';

//         if (materials.length === 0) {
//           materialSelect.innerHTML = '<option value="" disabled selected>No materials available</option>';
//           materialInput.value = '';
//           return;
//         }

//         // Placeholder
//         materialSelect.innerHTML = '<option value="" disabled selected>Select material...</option>';

//         // Real options
//         materials.forEach(material => {
//           const option = document.createElement('option');
//           option.value = material.id;
//           option.textContent = material.name;
//           materialSelect.appendChild(option);
//         });

//         // When selection changes → update input
//         materialSelect.addEventListener('change', (e) => {
//           const selectedId = e.target.value;
//           if (!selectedId) {
//             materialInput.value = '';
//             return;
//           }

//           const selected = materials.find(m => m.id == selectedId);
//           if (selected) {
//             materialInput.value = selected.name;
//             // Optional: materialInput.dataset.id = selectedId;
//           } else {
//             materialInput.value = '';
//           }
//         });
       
//       } catch (err) {
//         console.error("Error loading materials:", err);
//         materialSelect.innerHTML = '<option value="" disabled selected>Error loading materials</option>';
//         materialInput.value = '';
//       }
//     }
document.addEventListener("DOMContentLoaded", () => {
  loadMaterials();
  setupTransferForm();
});

async function loadMaterials() {
  const materialSelect = document.getElementById('materialSelect');
  const materialInput = document.getElementById('materialInput');
  const recipientSelect = document.getElementById(`recipientSelect`);
  let fromLocationSelect 
  const toLocationSelect = document.getElementById('toLocation');
  try {
    const res = await fetch('/allMaterials');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const materials = data.materials 
   console.log(materials, 'check from location id');
    materialSelect.innerHTML = '';

    if (materials.length === 0) {
      materialSelect.innerHTML = '<option disabled selected>No materials available</option>';
      return;
    }

    materialSelect.innerHTML =
      '<option value="" disabled selected>Select material...</option>';

    materials.forEach(material => {
      const option = document.createElement('option');
      option.value = material.id; // ✅ holds ID
      option.textContent = material.name;
      fromLocationSelect= material.location_id
      materialSelect.appendChild(option);
    });

    materialSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      const selected = materials.find(m => m.id == selectedId);
      materialInput.value = selected ? selected.name : '';
    });
   

   const ress = await fetch('/allWorkers');
if (!ress.ok) throw new Error(`HTTP ${ress.status}`);

const datta = await ress.json();
const workers = datta.workers || [];

recipientSelect.innerHTML = '';

if (workers.length === 0) {
  recipientSelect.innerHTML =
    '<option disabled selected>No workers available</option>';
  return;
}

recipientSelect.innerHTML =
  '<option value="" disabled selected>Select worker...</option>';

workers.forEach(worker => {
  const option = document.createElement('option');
  option.value = worker.id;          // ✅ ID goes here
  option.textContent = worker.userName; // ✅ name shown here
  recipientSelect.appendChild(option);
});

try {
  const ressss = await fetch('/api/locations');
  if (!ressss.ok) throw new Error(`HTTP ${ressss.status}`);

  
  const dataa = await ressss.json();
  const locations = dataa || [];

  // Clear existing options
  fromLocationSelect.innerHTML = '<option value="" disabled selected>Select source...</option>';
  toLocationSelect.innerHTML = '<option value="" disabled selected>Select destination...</option>';

  locations.forEach(location => {
    const fromOption = document.createElement('option');
    fromOption.value = location.location_id       // ✅ ID
    fromOption.textContent = materials.locationName; // ✅ user sees name
    // fromLocationSelect.appendChild(fromOption);
    console.log("in locatio", materials)

    const toOption = document.createElement('option');
    toOption.value = location.id;
    toOption.textContent = location.locationName;
    toLocationSelect.appendChild(toOption);
  });

} catch (err) {
  console.log("Error loading locations:", err);
  fromLocationSelect.innerHTML = '<option disabled selected>Error loading locations</option>';
  toLocationSelect.innerHTML = '<option disabled selected>Error loading locations</option>';
}

  } catch (err) {
    console.error("Error loading materials:", err);
    materialSelect.innerHTML =
      '<option disabled selected>Error loading materials</option>';
  }
}

function setupTransferForm() {
  const form = document.getElementById("transferMaterialForm");

  form.addEventListener("submit", async function (e) {
    e.preventDefault(); // 🔥 stop page reload

    const materialId = parseInt(document.getElementById("materialSelect").value);
    const quantity = parseFloat(document.getElementById("amountT").value);

    const fromLocationId = parseInt(document.getElementById("fromLocation").value);
    const toLocationId = parseInt(document.getElementById("toLocation").value);

    // 🔥 TEMP: hardcode recipient (replace with select later)
    const recipientId = parseInt(document.getElementById("recipientSelect").value)

    if (!materialId || !quantity || !fromLocationId || !toLocationId) {
      notify("All fields are required",'error');
      return;
    }

    if (fromLocationId === toLocationId) {
      notify("Cannot transfer to same location",'error');
      return;
    }
    console.log(materialId,quantity,fromLocationId,toLocationId)
    try {
        console.log("here")
      const responsee = await fetch(`/admin/transfer-to/${recipientId}`, {
        method: "POST",
        credentials: "include", // important for auth
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          materialId,
          quantity,
          fromLocationId,
          toLocationId
        })
      });

      const data = await responsee.json();

      if (!responsee.ok) throw new Error(data.message);

      notify("✅ Transfer successful" , 'success');
      form.reset();

    } catch (err) {
      alert("❌ cath here" + err.message);
      console.log(err);
    }
  });
}


    // Run when page loads
window.addEventListener('DOMContentLoaded', transferMaterial);
  




console.log("milkoooooo")



function notify(message, type = 'info', duration = 5000) {
    // Possible types: 'success', 'error', 'warning', 'info'
    
    const colors = {
        success: '#10b981',
        error:   '#ef4444',
        warning: '#f59e0b',
        info:    '#3b82f6'
    };

    const bgColor = colors[type] || colors.info;
    
    // Create toast element
    const toast = document.createElement('div');
    
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.top = '16px';
    toast.style.right = '16px';
    toast.style.padding = '12px 20px';
    toast.style.backgroundColor = bgColor;
    toast.style.color = 'white';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    toast.style.fontFamily = 'system-ui, sans-serif';
    toast.style.fontSize = '17px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '999999';
    toast.style.transform = 'translateY(-20px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.4s ease';
    toast.style.maxWidth = '380px';
    toast.style.wordBreak = 'break-word';

    document.body.appendChild(toast);

    // Show animation
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    // Auto hide
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            toast.remove();
        }, 400);
    }, duration);
}




// At the bottom of your script or in DOMContentLoaded
window.addEventListener('DOMContentLoaded', ()=>{
});
// or just:
displayAllUsers();
displayUsersTable()
displayMaterialsTable()




// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.getElementById('transferForm');
//   const alertContainer = document.getElementById('alertContainer');
//   const submitBtn = document.getElementById('submitBtn');

//   // You should replace these with real API endpoints that return your data
//   const MATERIALS_API = '/allMaterials';          // GET → list of materials
//   const LOCATIONS_API = '/locations';          // GET → list of locations
//   const TRANSFER_API  = '/admin/transfer-to/';     // POST + recipientId

//   // Load materials & locations when page opens
//   loadSelectOptions();

//   async function loadSelectOptions() {
//     try {
//       // Load materials
//       const matRes = await fetch(MATERIALS_API);
//       if (!matRes.ok) throw new Error('Failed to load materials');
//       const materials = await matRes.json();

//       const materialSelect = document.getElementById('materialId');
//       materials.forEach(m => {
//         const opt = document.createElement('option');
//         opt.value = m.id;
//         opt.textContent = `${m.name} (${m.unit})`;
//         materialSelect.appendChild(opt);
//       });

//       // Load locations
//       const locRes = await fetch(LOCATIONS_API);
//       if (!locRes.ok) throw new Error('Failed to load locations');
//       const locations = await locRes.json();

//       const fromSelect = document.getElementById('fromLocationId');
//       const toSelect   = document.getElementById('toLocationId');

//       locations.forEach(loc => {
//         const opt1 = document.createElement('option');
//         opt1.value = loc.id;
//         opt1.textContent = loc.name;
//         fromSelect.appendChild(opt1);

//         const opt2 = opt1.cloneNode(true);
//         toSelect.appendChild(opt2);
//       });

//     } catch (err) {
//       showAlert('danger', 'Error loading data: ' + err.message);
//     }
//   }

//   // Show Bootstrap alert
//   function showAlert(type, message) {
//     const alert = document.createElement('div');
//     alert.className = `alert alert-${type} alert-dismissible fade show`;
//     alert.innerHTML = `
//       ${message}
//       <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
//     `;
//     alertContainer.innerHTML = '';
//     alertContainer.appendChild(alert);
//   }

//   // Form submit
//   form.addEventListener('submit', async (e) => {
//     e.preventDefault();

//     submitBtn.disabled = true;
//     submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Transferring...';

//     const formData = new FormData(form);

//     const payload = {
//       materialId:     Number(formData.get('materialId')),
//       quantity:       Number(formData.get('quantity')),
//       fromLocationId: Number(formData.get('fromLocationId')),
//       toLocationId:   Number(formData.get('toLocationId'))
//     };

//     const recipientId = Number(formData.get('recipientId'));

//     try {
//       const response = await fetch(`${TRANSFER_API}${recipientId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           // Add Authorization header if you use JWT / session cookie is enough
//           // 'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         throw new Error(result.message || 'Transfer failed');
//       }

//       showAlert('success', result.message || 'Material transferred successfully!');
//       form.reset();

//     } catch (err) {
//       showAlert('danger', err.message || 'Something went wrong. Please try again.');
//     } finally {
//       submitBtn.disabled = false;
//       submitBtn.innerHTML = 'Transfer Material';
//     }
//   });
// });
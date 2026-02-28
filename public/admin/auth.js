// Shared function to fetch current user
async function fetchCurrentUser() {
    try {
        const res = await fetch("/me", {
            credentials: "include"
        });
        if (!res.ok) return null;
        const data = await res.text(); // /me returns plain text or JSON
        // Try to parse as JSON, fallback to text
        try {
            return JSON.parse(data);
        } catch {
            return data; // if it's just a string like "Not logged in"
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

// Setup registration (register.html)
async function setupRegister() {
      const message = document.getElementById("message")
      const form = document.getElementById("registerForm");   

      if(!form) return;
        
    form.addEventListener("submit" , async (e)=>{
         e.preventDefault();
          const username=form.username.value.trim()
          const Fname=form.Fname.value.trim()
          const jobPosition=form.jobPosition.value.trim()
          const password=form.password.value.trim()
        
           if(!username || !password || !Fname || !jobPosition){
             message.textContent="please fill all fields"
             message.style.color = "red";
             notify("all fields are required please", "error")
             return;
           }
           try {
              const res =await fetch("/register", {
                        method: "POST",
                        headers:{"Content-Type" : "application/json"},
                        body:JSON.stringify({username, password, Fname, jobPosition}),
                        credentials: "include" // send cookies for session if needed later
                  });

                  const data = await res.json();
                  notify(data.message,"success");
                  message.textContent=data.message;
                  message.style.color=res.ok ? "green" : "red";
                   

               if (res.status === 201) {
                form.reset();
                setTimeout(()=> window.location.href="",1500)} // this gives user time to read message before redirecting 

           } catch (error) {
            notify("Server error. Try again.", "error");
               message.textContent = "Server error";
               message.style.color = "red";
           }
    })
    }

// Setup login (login.html)
async function setupLogin() {
     const form = document.getElementById("loginForm");
     const message = document.getElementById('message');

            if (!form)    return; // stop execution
   

   form.addEventListener("submit", async(e)=>{
       e.preventDefault();
          const username=form.username.value.trim()
          const password=form.password.value.trim()

          if(!username || !password){
              notify("all fields are required please", "error")
              return;
          }

          try {
                const res= await fetch("/login",{
                           method:"POST",
                           headers: {"Content-Type" : "application/json"},
                           body:JSON.stringify({password, username}),
                           credentials: "include" 
                });

             const data = await res.json();

             if(data.success){
              message.textContent = "Login successful !"
              message.style.color="green";
                  const target= data.user.role ==="admin" ?"/admin.html" :"dashboard.html";
                   setTimeout(() =>  window.location.href=target, 1000)
             }
             else{
              message.textcontent=data.message || "Login failed"
              message.style.color="red";
             }
          } catch (error) {
                   message.textContent = "Server error. Try again.";
                   message.style.color = "red";
          }

   })
}

// Setup protected pages (dashboard.html & admin.html)     u need to know this logic milko
async function SetupProtectedPage(options={}){
   const welcomeEl= document.getElementById("welcome")  /// check this later
   const user = await fetchCurrentUser(); 
     
      if(!user || (typeof user ==="string" && user.includes("not logged in"))){
        welcomeEl.textContent = "youre not logged in . redirecting to login page "
        welcomeEl.style.color= 'red';
        setTimeout(()=>window.location.href="/login.html",1000)
        return;
      }
      // user is object with id, username, role
        welcomeEl.textContent = `Welcome, ${user.username}! (Role: ${user.role})`;
        welcomeEl.style.color = "green";

    // Optional: hide admin content if not admin
    if (options.requireAdmin && user.role !== "admin") {
        welcomeEl.textContent = "Access denied: Admin only";
        welcomeEl.style.color = "red";
        setTimeout(() => window.location.href = "/login.html", 2000);
    }
}
SetupProtectedPage();

 //// setup logout on any page
function setupLogout(){
   document.querySelectorAll("#logoutBtn, .logoutBtn").forEach(btn=>{
     btn.addEventListener("click",async ()=>{
       try {
          const res = await fetch("/logout",{
             method :"POST",
            credentials:"include"
          });
          const data = await res.json();
          if(data.success) {
             window.location.href ="/login.html";
          }
          else {
             alert("Logout failed : " +(data.message || "unknown error"));
          }
       }catch(err){
          alert("Network error during logout");
        }
     } 
        )
   })
}
   
///auto initialise everything when page loads
document.addEventListener("DOMContentLoaded", ()=>{
    setupRegister();
    setupLogin();
    setupLogout();
    if(document.getElementById("welcome")){
      if(document.title.includes("Admin")){
        SetupProtectedPage({requireAdmin : true})
      }
      else {
        SetupProtectedPage()
      }
    }
})

// //////my code logout 

// function initLogout(logoutBtnId="logoutBtn"){
//       const logoutBtn = document.getElementById("logoutBtnId");
//       if(!logoutBtn) return;

//       logoutBtn.addEventListener("click" , async()=>{
//          try{
//             const res = await fetch("/logout" , {
//                  method:"POST",
//                  credentials: "include"
//             });

//             const data = await res.json();

//             if(data.success){
//                 window.location.href = "/login.html"
//             }else {
//                const pupop=createElement.apply("div");
//                popup.textContent = data.message;
//                 popup.id="popup";
//                setTimeout(function () {
                       
//                        popup.style.opacity = '0';
//                        setTimeout(function () {
//                            popup.remove();
//                        }, 400); // match CSS transition duration
//     }, 5000);
//             }
//          } catch{
//           console.error(err);
//       alert("Server error during logout");
    
//          }
//       })
// }

// initLogout()

function initLogoutAll() {
  document.querySelectorAll(".logoutBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch("/logout", {
          method: "POST",
          credentials: "include"
        });
        const data = await res.json();
        if (data.success) window.location.href = "/login.html";
      } catch (err) {
        console.error(err);
      }
    });
  });
}

initLogoutAll();

 

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

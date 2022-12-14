window.onscroll = function () {
    // Hide and display the go to top button
    var top = document.getElementById("goup");
    if (pageYOffset >= 100) {
        top.style.display = "unset";
    } else {
        top.style.display = "none";
    }
    // Hide and show Go down button
    var down = document.getElementById("down");
    if (pageYOffset >= 500) {
        down.style.display = "none";
    } else {
        down.style.display = "flex";
    }
};
// Collapsable nav bar
var nav = document.getElementById("dropdown");
var header = document.getElementById("tocollapse");
// nav.addEventListener('click', function () {
// if (header.style.display === "block") { //if nav is visible then hide
//     header.style.height = "0";
//     header.style.display = "none";
//     document.getElementById("dropdown-img").src = "imgs/dropdown.png"
// } else { //if nav is not visible , then display
//     header.style.height = "100vh";
//     header.style.display = "block";
//     document.getElementById("dropdown-img").src = "imgs/close.png"
// }
// });
function openclosenav() {
    if (header.style.display === "block") { //if nav is visible then hide
        header.style.height = "0";
        header.style.display = "none";
        document.getElementById("dropdown-img").src = "/imgs/dropdown.png"
    } else { //if nav is not visible , then display
        header.style.height = "100vh";
        header.style.display = "block";
        document.getElementById("dropdown-img").src = "/imgs/close.png"
    }
}
// Nav closes when clicked on item - only for mobile version
var navitems = document.getElementsByClassName("nav-items");
function screen_resize() {
    if (window.innerWidth >= 990) {
        header.style.display = "inline";
    } else if (window.innerWidth < 990) {
        header.style.display = "none";
        document.getElementById("dropdown-img").src = "/imgs/dropdown.png"
        // nav closes after clicking on a location
        for (let i = 0; i < 3; i++) {
            navitems[i].addEventListener('click', function () {
                if (header.style.display == "block") { //if nav is visible then hide
                    header.style.height = "0";
                    header.style.display = "none";
                    document.getElementById("dropdown-img").src = "/imgs/dropdown.png"
                }
            });
        }
    }
}
// if window resize call responsive function
$(window).resize(function () {
    screen_resize();
});
// call responsive function on default :)
$(document).ready(function () {
    screen_resize();
});
// FORM  - hide unhide password
var pass = document.getElementById("see-pass");
var password = document.getElementById("pass");
function hideunhidepass() {
    if (pass.classList == 'far fa-eye') {
        pass.className = 'far fa-eye-slash';
        password.type = "text";
        // setTimeout(hideunhidepass, 2000);
    }
    else {
        pass.className = 'far fa-eye';
        password.type = "password";
    }
};
// FORM VAlidation
var submit = document.getElementById("reg-form");
var error = document.getElementById("error");
var errormsg = document.getElementById("error-msg");
if (submit) {
    submit.onsubmit = function (e) {
        // password validation
        let pass = document.getElementById("pass");
        let pass2 = document.getElementById("pass2");
        let pass_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!pass_pattern.test(pass.value)) {
            e.preventDefault();
            errormsg.innerHTML = "A password must contain the following:<li>A Lowercase and a Uppercase letter</li><li>A number</li><li>A Special Character</li><li>Minimum 8 characters</li>";
            error.style.display = "flex";
        } else {
            if (pass.value != pass2.value) {
                e.preventDefault();
                errormsg.innerHTML = "Passwords do not match!";
                error.style.display = "flex";
            }
        }
    };
}
var errorBtn = document.getElementById("error-btn");
if (errorBtn) {
    errorBtn.addEventListener("click", function () {
        error.style.display = 'none';
    });
}
//LOGIN FORM CLOSE
const loginError = document.querySelector("#login-error");
var loginErrorBtn = document.getElementById("login-error-btn");
if (loginErrorBtn) {
    loginErrorBtn.addEventListener("click", function () {
        loginError.style.display = 'none';
        console.log(loginError)
    });
}
// Assigning Age after inputting DOB
var dob_input = document.getElementById("dob");
var age = document.getElementById("age");
if (dob_input) {
    dob_input.addEventListener("input", function () {
        let dob = new Date(dob_input.value);
        // Calculating number of months till dob
        let months = dob.getFullYear() * 12 + dob.getMonth();

        // Calculating number of months till present
        let today = new Date();
        today = today.getFullYear() * 12 + today.getMonth();

        // Calculating age
        let calc_age = Math.trunc(today / 12 - months / 12);

        // Putting age in age field
        age.value = calc_age;
    });
}
// Help button
// var helpBtn = document.getElementById("help-btn");
// if (helpBtn) {
//     helpBtn.addEventListener("click", function () {
//         help.style.display = 'flex';
//     });
// }
let helpMenu = document.querySelector("#chat-help");
let helpContent = document.querySelector("#help-content")
let helpBtn = document.querySelector("#settings-btn");
helpBtn.addEventListener('click',()=>{
    console.log("clicked")
    if(helpMenu.classList.contains('hidden')){
        // removing closing animaiton if exists
        helpMenu.classList.remove('menu-close')
        helpContent.classList.remove('menu-close')
        // opening animation for help menu
        helpMenu.classList.toggle('hidden')
        helpMenu.classList.toggle('menu-open')
        // opening animation for help content
        helpContent.classList.toggle('menu-open')
        helpContent.classList.toggle('hidden')
    }else{
        closeMenu()
    }

})
function closeMenu(){
    // removing opening animation
    helpMenu.classList.remove('menu-open')
    helpContent.classList.remove('menu-open')
    // adding closing animation
    helpMenu.classList.toggle('menu-close')
    helpContent.classList.toggle('menu-close')
    // hiding the menu
    setTimeout(()=>{
        helpMenu.classList.toggle('hidden')
        helpContent.classList.toggle('hidden')
    },450)
}
let closeBtn = document.getElementById("close-btn");
closeBtn.addEventListener("click", function () {
        closeMenu()
    })
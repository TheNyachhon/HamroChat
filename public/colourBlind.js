const switchTheme = document.querySelector("#colour-blind")
const switchThemeIcon = document.querySelector("#colour-blind>i")
const root = document.querySelector(':root')
const rootVal = getComputedStyle(root)
let x = 0;
console.log(sessionStorage.getItem('theme'))
if(sessionStorage.getItem('theme')=='colourBlind'){
    colourBlindTheme()
}else if(sessionStorage.getItem('theme')==null){
    sessionStorage.setItem('theme','notColourBlind')
}else{
    colourBlindThemeDisable()
}
let text = document.querySelector('#text')

switchTheme.addEventListener('mouseover', () => {
    text.style.display = 'block'
})
switchTheme.addEventListener('mouseout', () => {
    text.style.display = 'none'
})
switchTheme.addEventListener('click', () => {
    text.style.display = 'none'
    if(switchThemeIcon.classList.contains('rotate-icon')){
        switchThemeIcon.classList.toggle('rotate-icon-alt')
        setTimeout(()=>{
            switchThemeIcon.classList.toggle('rotate-icon-alt')
            switchThemeIcon.classList.toggle('rotate-icon')
        },1000)
    }else{
        switchThemeIcon.classList.add('rotate-icon')
    }
    let theme=sessionStorage.getItem('theme')
    if (theme=='notColourBlind') {
        colourBlindTheme()
        sessionStorage.setItem("theme", "colourBlind");
        // x=1;
    }else{
        colourBlindThemeDisable()
        sessionStorage.setItem("theme", "notColourBlind");
        // x=0;
    }
})
function colourBlindTheme() {
    setTimeout(() => {
        console.log("Enabling colour blind mode")
        // root.style.setProperty('--userMsgBox', '#E1BE6A');
        root.style.setProperty('--userMsgBox', '#FFC20A');
        root.style.setProperty('--userMsgBoxHover', '#FEFE62');
        // root.style.setProperty('--backgroundGradStart', '#006CD1');
        // root.style.setProperty('--backgroundGradEnd', '#006CD1');
        // Background
        root.style.setProperty('--backgroundGradStart', '#0C7BDC');
        root.style.setProperty('--backgroundGradEnd', '#0C7BDC');
        root.style.setProperty('--backgroundGradStartAbout', '#0C7BDC 0%');
        root.style.setProperty('--backgroundGradEndAbout', '#0C7BDC 100%');
        // 
        root.style.setProperty('--changeTheme', '#994F00');
        root.style.setProperty('--addUserBtn', '#DC3220');
        root.style.setProperty('--logoutBtn', '#DC3220');
        root.style.setProperty('--detailsBox', '#FFC20A');
        root.style.setProperty('--selfMsg', '');
        root.style.setProperty('--friendMsg', '#00D06D');
        root.style.setProperty('--helpContainer', '#FFC20AA5');
        root.style.setProperty('--aboutText', 'white');
        root.style.setProperty('--homeSubHeading', 'white'); //The only HamroChat you'll need
        root.style.setProperty('--featuresText', 'white');
    }, 500)
}
function colourBlindThemeDisable() {
    setTimeout(() => {
        console.log("Disabling colour blind mode")
        root.style.setProperty('--userMsgBox', '#F0F0F080');
        root.style.setProperty('--userMsgBoxHover', '#F0F0F0AA');
        // Background
        root.style.setProperty('--backgroundGradStart', '#92FE9D 0%');
        root.style.setProperty('--backgroundGradEnd', '#00C9FF 100%');
        root.style.setProperty('--backgroundGradStartAbout', '#92FE9D 0%');
        root.style.setProperty('--backgroundGradEndAbout', '#92FE9D 100%');
        // 
        root.style.setProperty('--changeTheme', '#4B0092');
        root.style.setProperty('--addUserBtn', '#1E90FF');
        root.style.setProperty('--logoutBtn', '#FE2f02');
        root.style.setProperty('--detailsBox', 'rgba( 255, 255, 255, 0.40 )');
        root.style.setProperty('--selfMsg', 'rgba( 255, 255, 255, 0.40 )');
        root.style.setProperty('--friendMsg', 'rgba(0, 163, 255, 0.5)');
        root.style.setProperty('--helpContainer', 'rgba( 255, 255, 255, 0.10 )');
        root.style.setProperty('--aboutText', '#304352');
        root.style.setProperty('--homeSubHeading', '#36454fDF');
        root.style.setProperty('--featuresText', '#36454fDF');
        // document.querySelector('nav ul').style.fontWeight = '400'
    }, 500)
}
const dateVal = document.getElementById('dater');

const finValue = (ymd) => {
    const [year, month, day] = ymd.split("-");
    return `${day}-${month}-${year}`;
}

function submit() {
    const rawDate = dateVal.value;   // yyyy-mm-dd
    console.log(finValue(rawDate));  // dd-mm-yyyy
    alert(finValue(rawDate));
}
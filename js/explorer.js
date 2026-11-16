// Author: Dre Harm
// Date: 11/15/2026

// we have to get rid of the selected filters since each dataset has different attributes
document.querySelectorAll('input[name="dataset"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        window.location.href = "explorer.php?dataset=" + encodeURIComponent(radio.value);
    });
});

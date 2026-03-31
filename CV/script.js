document.getElementById("cvForm").addEventListener("submit", function(e) {
  e.preventDefault();

  // Collect values
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;
  const degree = document.getElementById("degree").value;
  const institution = document.getElementById("institution").value;
  const year = document.getElementById("year").value;
  const skills = document.getElementById("skills").value;

  // Build CV HTML
  const cvHTML = `
    <h2>${name}</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Phone:</strong> ${phone}</p>
    <p><strong>Address:</strong> ${address}</p>
    <hr>
    <h4>Education</h4>
    <p>${degree} - ${institution} (${year})</p>
    <hr>
    <h4>Skills</h4>
    <p>${skills}</p>
  `;

  document.getElementById("cvContent").innerHTML = cvHTML;
  document.getElementById("cvPreview").classList.remove("d-none");
});

// Export to PDF
function downloadCV() {
  const element = document.getElementById("cvContent");
  html2pdf().from(element).save("My_CV.pdf");
}

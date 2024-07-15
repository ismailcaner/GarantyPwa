let db;
let intervalId;
window.initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/${file}`
}).then(SQL => {
 
    db = new SQL.Database();
    

    const savedDb = localStorage.getItem('myDatabase');
    if (savedDb) {
        db = new SQL.Database(new Uint8Array(JSON.parse(savedDb)));
    } else {
   
        db.run("CREATE TABLE contacts (id INTEGER PRIMARY KEY, name TEXT, email TEXT, start_date TEXT, end_date TEXT);");
    }


    document.getElementById('dataForm').addEventListener('submit', function(event) {
        event.preventDefault();
        
   
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

       
        db.run("INSERT INTO contacts (name, email, start_date, end_date) VALUES (?, ?, ?, ?)", [name, email, startDate, endDate]);
        
   
        document.getElementById('dataForm').reset();
        
       
        saveDatabase();
        window.location.href = "index.html";
     
        displayData();
    });


    function saveDatabase() {
        const data = db.export();
        localStorage.setItem('myDatabase', JSON.stringify(Array.from(new Uint8Array(data))));
    }

   
    function displayData() {
        const res = db.exec("SELECT * FROM contacts");
        const outputContainer = document.getElementById("output");
        outputContainer.innerHTML = '';
        if (res.length) {
            res[0].values.forEach(row => {

                const id = row[0];
                const name = row[1];
                const email = row[2];
                const startDate = row[3];
                const endDate = row[4];

                const nowdate = new Date();
                const enddate = new Date(row[4]);  
                const islem = enddate - nowdate;
                const daysLeft = Math.ceil(islem / (1000 * 3600 * 24));

                let containerClass = '';
                let backgroundColor = '';
                if (daysLeft >= 365) {
                    textColor = '#1d7952';
                    backgroundColor = '#d2ffe4'; 
                } else if (daysLeft >= 180) {
                    textColor = '#485365';
                    backgroundColor = '#f2f4f7'; 
                } else if (daysLeft >= 90 || daysLeft > 30) {
                    textColor = '#bf5f28';
                    backgroundColor = '#fffaea'; 
                } else if ( daysLeft <= 30 ){
                    textColor = '#be4239';
                    backgroundColor = '#fad5d2';
                }
                
                const div = document.createElement("div");
                div.innerHTML = `
                <div class="deneme">
                    <div class="deneme1">
                        <span id="name-${id}" style='font-weight:bold;'>${name}</span>
                        <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash xl"></i></button>
                    </div>
                    <div class="deneme1">
                        <span id="email-${id}"> ${email}</span>
                        <span id="end-date" style="background-color: ${backgroundColor}; color: ${textColor};"><i class="fa-regular fa-calendar"></i> ${daysLeft} Gün kaldı</span>
                    </div>
                </div>
                `;
                
                div.querySelector('.btn-delete').addEventListener('click', () => deleteRow(id));
                outputContainer.appendChild(div);
            });
        } else {
            const span = document.createElement("span");
            span.textContent = "Ürün yok";
            outputContainer.appendChild(span);
        }
    }
    
    function deleteRow(id) {
        db.run("DELETE FROM contacts WHERE id = ?", [id]);
        saveDatabase();
        displayData();
    }
    
    displayData();

    function updateData() {
        displayData();
    }

    intervalId = setInterval(updateData, 100000000); 

}).catch(err => {
    console.error('Failed to initialize SQL.js:', err);
});

function add() {
    window.location.href = 'add.html';
}

function home() {
    window.location.href = 'index.html';
}


function moveCursorToEnd(inputElement) {
    var length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
}



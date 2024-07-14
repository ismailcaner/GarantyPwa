let db;
let intervalId;
// WebAssembly modülünü başlat ve veritabanını oluştur
window.initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/${file}`
}).then(SQL => {
    // Veritabanını oluşturun
    db = new SQL.Database();
    
    // Veritabanı içeriğini localStorage'dan yükle
    const savedDb = localStorage.getItem('myDatabase');
    if (savedDb) {
        db = new SQL.Database(new Uint8Array(JSON.parse(savedDb)));
    } else {
        // Tablo oluştur
        db.run("CREATE TABLE contacts (id INTEGER PRIMARY KEY, name TEXT, email TEXT, start_date TEXT, end_date TEXT);");
    }

    // Form verilerini işleme
    document.getElementById('dataForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Formun varsayılan olarak gönderilmesini engelle
        
        // Formdan veri al
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        // Veriyi tabloya ekleyin
        db.run("INSERT INTO contacts (name, email, start_date, end_date) VALUES (?, ?, ?, ?)", [name, email, startDate, endDate]);
        
        // Formu temizle
        document.getElementById('dataForm').reset();
        
        // Veritabanını localStorage'a kaydet
        saveDatabase();
        window.location.href = "index.html";
        // Verileri yeniden görüntüleyin
        displayData();
    });

    // Veritabanını localStorage'a kaydetme
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
                    backgroundColor = '#fef3f2';
                }
                
                const div = document.createElement("div");
                div.innerHTML = `
                <div class="deneme">
                    <div class="deneme1">
                        <span id="name-${id}">${name}</span>
                        <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash fa-xm"></i></button>
                    </div>
                    <div class="deneme1">
                        <span id="email-${id}"> ${email}</span>
 <span id="end-date" style="background-color: ${backgroundColor}; color: ${textColor};">${daysLeft} Gün kaldı</span>
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

    intervalId = setInterval(updateData, 1); 

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

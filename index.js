let db;
let intervalId;

// WebAssembly modülünü başlat ve veritabanını oluştur
window.initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.1/sql-wasm.wasm`
}).then(SQL => {
    // Veritabanını oluşturun
    db = new SQL.Database();
    
    // Veritabanı içeriğini localStorage'dan yükle
    const savedDb = localStorage.getItem('myDatabase');
    if (savedDb) {
        db = new SQL.Database(new Uint8Array(JSON.parse(savedDb)));
    } else {
        // Tabloyu oluşturun
        db.run(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY,
                name TEXT,
                email TEXT,
                start_date TEXT,
                end_date TEXT,
                pdf BLOB
            );
        `);
    }

    // Form verilerini işleme
    document.getElementById('dataForm').addEventListener('submit', function(event) {
        event.preventDefault(); // Formun varsayılan olarak gönderilmesini engelle
        
        // Formdan veri al
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const pdfFile = document.getElementById('pdf-file').files[0];

        // PDF dosyasını okuyun
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const pdfData = new Uint8Array(event.target.result);

                // Veriyi tabloya ekleyin
                db.run("INSERT INTO contacts (name, email, start_date, end_date, pdf) VALUES (?, ?, ?, ?, ?)", [name, email, startDate, endDate, pdfData]);

                // Formu temizle
                document.getElementById('dataForm').reset();

                // Veritabanını localStorage'a kaydet
                saveDatabase();
                window.location.href = "index.html";
            } catch (error) {
                console.error("Veritabanı hatası:", error);
            }
        };
        reader.readAsArrayBuffer(pdfFile);
    });

    // Veritabanını localStorage'a kaydetme
    function saveDatabase() {
        const data = db.export();
        localStorage.setItem('myDatabase', JSON.stringify(Array.from(new Uint8Array(data))));
    }

    // Veritabanındaki verileri görüntüleme
    function displayData() {
        const res = db.exec("SELECT * FROM contacts");
        const outputContainer = document.getElementById("output");
        outputContainer.innerHTML = '';
        if (res.length) {
            res[0].values.forEach(row => {
                const id = row[0];
                const name = row[1];
                const email = row[2];
                const endDate = row[4];
                const pdfData = row[5];

                const now = new Date();
                const end = new Date(endDate);  
                const diff = Math.ceil((end - now) / (1000 * 3600 * 24));

                const div = document.createElement("div");
                div.innerHTML = `
                    <div class="deneme">
                        <div class="deneme1">
                            <span id="name-${id}">${name}</span>
                            <button class="btn-delete" data-id="${id}"><i class="fa-solid fa-trash fa-xm"></i></button>
                        </div>
                        <div class="deneme1">
                            <span id="email-${id}">${email}</span>
                            <span id="end-date">${diff} Gün kaldı</span>
                            <button class="btn-view" data-id="${id}">PDF Görüntüle</button>
                        </div>
                    </div>
                `;

                div.querySelector('.btn-delete').addEventListener('click', () => deleteRow(id));
                div.querySelector('.btn-view').addEventListener('click', () => viewPdf(pdfData));
                outputContainer.appendChild(div);
            });
        } else {
            const span = document.createElement("span");
            span.textContent = "Ürün yok";
            outputContainer.appendChild(span);
        }
    }

    function viewPdf(pdfData) {
        const blob = new Blob([new Uint8Array(pdfData)], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    }

    function deleteRow(id) {
        db.run("DELETE FROM contacts WHERE id = ?", [id]);
        saveDatabase();
        displayData();
    }

    displayData();


    intervalId = setInterval(displayData, 10000);

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

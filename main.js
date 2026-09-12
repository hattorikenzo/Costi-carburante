geotab.addin.fuelCostPage = function () {
    let api, state;

    return {
        initialize: function (freshApi, freshState, initializeCallback) {
            api = freshApi;
            state = freshState;

            // Associa l'evento al pulsante di caricamento dati
            const loadBtn = document.getElementById('loadDataBtn');
            if (loadBtn) {
                loadBtn.addEventListener('click', function () {
                    fetchFillUpsAndCosts(api);
                });
            }

            initializeCallback();
        },
        focus: function () {
            // Eseguito ogni volta che l'utente apre o mette a fuoco la pagina dell'add-in
        },
        blur: function () {
            // Eseguito quando l'utente lascia la pagina
        }
    };
};

function fetchFillUpsAndCosts(api) {
    const tableBody = document.querySelector('#fuelTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Caricamento in corso...</td></tr>';

    // Chiamata API Geotab per recuperare i rifornimenti registrati
    api.call("Get", {
        typeName: "FillUp",
        resultsLimit: 50
    }, function (result) {
        tableBody.innerHTML = '';

        if (!result || result.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Nessun rifornimento trovato.</td></tr>';
            return;
        }

        result.forEach(function (fillUp) {
            let date = new Date(fillUp.dateTime).toLocaleString();
            let deviceName = fillUp.device ? (fillUp.device.name || fillUp.device.id) : "Sconosciuto";
            let volume = fillUp.volume ? fillUp.volume.toFixed(2) + " L" : "0 L";
            let cost = fillUp.cost ? fillUp.cost.toFixed(2) + " " + (fillUp.currencyCode || "EUR") : "Non specificato";
            
            let unitPrice = "-";
            if (fillUp.cost && fillUp.volume && fillUp.volume > 0) {
                let price = fillUp.cost / fillUp.volume;
                unitPrice = price.toFixed(3) + " " + (fillUp.currencyCode || "EUR") + "/L";
            }

            // Link di rimando al portale MISE per il controllo dei prezzi al consumo nella zona
            let actionHtml = `<a href="https://carburanti.mise.gov.it/ospzSearch/zona" target="_blank" style="color: #0066cc; text-decoration: underline;">Verifica sul MISE</a>`;

            let row = `<tr>
                <td>${date}</td>
                <td>${deviceName}</td>
                <td>${volume}</td>
                <td>${cost}</td>
                <td><b>${unitPrice}</b></td>
                <td>${actionHtml}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });
    }, function (error) {
        console.error("Errore nel recupero dei dati da MyGeotab:", error);
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Errore durante il caricamento dei dati.</td></tr>';
    });
}
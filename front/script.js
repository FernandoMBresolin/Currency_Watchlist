document.addEventListener('DOMContentLoaded', async function() {
    const currencies = [
        {"code": "USD", "name": "Dólar Americano"},
        {"code": "EUR", "name": "Euro"},
        {"code": "GBP", "name": "Libra Esterlina"},
        {"code": "CAD", "name": "Dólar Canadense"},
        {"code": "CHF", "name": "Franco Suíço"},
        {"code": "ARS", "name": "Peso Argentino"},
        {"code": "CLP", "name": "Peso Chileno"},
        {"code": "AUD", "name": "Dólar Australiano"},
        {"code": "JPY", "name": "Iene Japonês"},
        {"code": "CNY", "name": "Yuan Chinês"},
        {"code": "INR", "name": "Rúpia Indiana"},
        {"code": "MXN", "name": "Peso Mexicano"},
        {"code": "BTC", "name": "Bitcoin"},
        {"code": "ETH", "name": "Ethereum"},
        {"code": "BNB", "name": "Binance Coin"},
        {"code": "ADA", "name": "Cardano"},
        {"code": "SOL", "name": "Solana"}
    ];

    const currencySelect = document.getElementById('currencySelect');
    const baseSelect = document.getElementById('baseSelect');
    const updateRatesButton = document.getElementById('updateRatesButton');
    const watchlist = document.getElementById('watchlist');

    let localWatchlist = [];
    let brlRateUSD = null; // Armazena a taxa do BRL em relação ao USD
    let isProcessing = false; // Evita chamadas simultâneas

    // Busca a taxa inicial do BRL ao carregar o frontend
    async function fetchInitialBRLRate() {
        console.log('Buscando taxa inicial do BRL...');
        try {
            const apiKey = '496b3693209c4eb6875da289dcd947dd';
            const url = `https://api.currencyfreaks.com/latest?apikey=${apiKey}&symbols=BRL`;
            const response = await fetch(url);
            console.log('Status da resposta da API externa (BRL inicial):', response.status);
            if (!response.ok) throw new Error(`Erro ${response.status}`);
            const data = await response.json();
            console.log('Dados recebidos para BRL inicial:', data);
            const rates = data.rates || {};
            if (rates['BRL']) {
                brlRateUSD = parseFloat(rates['BRL']);
                console.log(`Taxa inicial do BRL salva: ${brlRateUSD}`);
            } else {
                console.log('Taxa do BRL não retornada pela API');
            }
        } catch (error) {
            console.error('Erro ao buscar taxa inicial do BRL:', error);
        }
    }

    async function loadWatchlist() {
        if (isProcessing) {
            console.log('Ignorando loadWatchlist: outra operação em andamento');
            return;
        }
        console.log('Carregando watchlist inicial...');
        isProcessing = true;
        try {
            const response = await fetch('http://127.0.0.1:5000/currencies');
            console.log('Resposta do backend:', response.status);
            if (!response.ok) throw new Error('Erro na API');
            const data = await response.json();
            console.log('Dados recebidos do backend:', data);

            if (data.message) {
                localWatchlist = [];
            } else {
                localWatchlist = data.map(c => ({
                    code: c.code,
                    name: c.name,
                    rate: c.rate ? parseFloat(c.rate).toFixed(6) : '---',
                    updated_at: c.updated_at || null
                }));
            }
            const savedCodes = data.message ? [] : data.map(c => c.code);
            const availableCurrencies = currencies.filter(c => !savedCodes.includes(c.code));
            populateCurrencySelect(availableCurrencies);
            watchlist.innerHTML = '';
            if (!data.message) {
                data.forEach(currency => createCard(
                    currency.code,
                    currency.name,
                    currency.rate ? parseFloat(currency.rate).toFixed(6) : '---',
                    currency.updated_at
                ));
            }
            updateDisplayRates();
        } catch (error) {
            console.error('Erro ao carregar watchlist (rodando offline):', error);
            populateCurrencySelect(currencies);
            watchlist.innerHTML = '';
            localWatchlist.forEach(currency => createCard(currency.code, currency.name, currency.rate, currency.updated_at));
        } finally {
            isProcessing = false;
        }
    }

    function populateCurrencySelect(availableCurrencies) {
        console.log('Populando select com moedas disponíveis:', availableCurrencies.map(c => c.code));
        currencySelect.innerHTML = '<option value="" disabled selected>Selecione uma moeda</option>';
        availableCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = `${currency.name} (${currency.code})`;
            currencySelect.appendChild(option);
        });
    }

    function createCard(currencyCode, currencyName, rate = '---', updated_at = null) {
        const existingCard = document.getElementById(`card-${currencyCode}`);
        if (existingCard) {
            console.log(`Card para ${currencyCode} já existe, ignorando criação`);
            return;
        }

        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${currencyCode}`;
        // Ajuste explícito para BRT (UTC-3)
        let displayDate = '---';
        if (updated_at) {
            const date = new Date(updated_at);
            // Subtrai 3 horas (10800000 ms) para converter de UTC para BRT
            date.setTime(date.getTime() - 3 * 60 * 60 * 1000);
            displayDate = date.toLocaleString('pt-BR');
        }
        card.innerHTML = `
            <h3>${currencyName}</h3>
            <p class="symbol">${currencyCode}</p>
            <p class="rate">Taxa: ${typeof rate === 'number' ? rate.toFixed(6) : rate}</p>
            <p class="updated_at">Atualizado: ${displayDate}</p>
            <button class="remove-btn">Remover</button>
        `;
        const removeBtn = card.querySelector('.remove-btn');
        removeBtn.addEventListener('click', async () => {
            if (isProcessing) {
                console.log(`Ignorando remoção de ${currencyCode}: outra operação em andamento`);
                return;
            }
            console.log(`Iniciando remoção de ${currencyCode}...`);
            isProcessing = true;
            try {
                const response = await fetch(`http://127.0.0.1:5000/currencies/${currencyCode}`, { 
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                console.log(`Resposta do DELETE para ${currencyCode}:`, response.status);
                if (!response.ok) throw new Error('DELETE falhou');
                console.log(`Moeda ${currencyCode} removida do backend`);
            } catch (error) {
                console.warn('Erro ao remover no backend, prosseguindo localmente:', error);
            }

            // Remove localmente sem recarregar a watchlist
            card.remove();
            localWatchlist = localWatchlist.filter(c => c.code !== currencyCode);
            const removedCurrency = currencies.find(c => c.code === currencyCode);
            if (removedCurrency) {
                const option = document.createElement('option');
                option.value = removedCurrency.code;
                option.textContent = `${removedCurrency.name} (${currencyCode})`;
                currencySelect.appendChild(option);
            }
            console.log(`Watchlist local atualizada após remoção de ${currencyCode}:`, JSON.stringify(localWatchlist, null, 2));
            updateDisplayRates();
            console.log(`Remoção de ${currencyCode} concluída`);
            isProcessing = false;
        });
        watchlist.appendChild(card);
        console.log(`Card criado para ${currencyCode}`);
    }

    currencySelect.addEventListener('change', async function() {
        if (isProcessing) {
            console.log('Ignorando seleção de moeda: outra operação em andamento');
            return;
        }
        const selectedCode = this.value;
        const selectedCurrency = currencies.find(c => c.code === selectedCode);
        if (selectedCurrency && !document.getElementById(`card-${selectedCode}`)) {
            console.log(`Iniciando adição de ${selectedCode}...`);
            isProcessing = true;
            createCard(selectedCode, selectedCurrency.name);
            localWatchlist.push({ code: selectedCode, name: selectedCurrency.name, rate: '---', updated_at: null });
            
            try {
                const response = await fetch('http://127.0.0.1:5000/currencies', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: selectedCode })
                });
                console.log(`Resposta do POST para ${selectedCode}:`, response.status);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Erro ao salvar no backend');
                }
                const data = await response.json();
                console.log('Moeda salva no backend:', data);
            } catch (error) {
                console.warn('Erro ao salvar no backend, prosseguindo localmente:', error);
            }

            // Remove a moeda do select localmente
            const optionToRemove = currencySelect.querySelector(`option[value="${selectedCode}"]`);
            if (optionToRemove) optionToRemove.remove();
            console.log(`Watchlist local atualizada após adição de ${selectedCode}:`, JSON.stringify(localWatchlist, null, 2));
            updateDisplayRates();
            console.log(`Adição de ${selectedCode} concluída`);
            isProcessing = false;
        }
        this.selectedIndex = 0;
    });

    async function updateRates() {
        if (isProcessing) {
            console.log('Ignorando atualização de taxas: outra operação em andamento');
            return;
        }
        console.log('Botão "Atualizar Taxas" clicado');
        isProcessing = true;
        const baseCurrency = baseSelect.value;
        const cards = document.querySelectorAll('.card');
        if (cards.length === 0) {
            console.log('Nenhum card para atualizar');
            alert('Nenhum card para atualizar');
            isProcessing = false;
            return;
        }

        let symbolsSet = new Set();
        cards.forEach(card => symbolsSet.add(card.id.replace('card-', '')));
        // Sempre inclui BRL para obter sua taxa
        symbolsSet.add('BRL');

        const validSymbols = Array.from(symbolsSet).filter(code => 
            currencies.some(c => c.code === code) || /^[A-Z]{3}$/.test(code)
        );
        const symbols = validSymbols.length > 0 ? validSymbols.join(',') : null;

        if (!symbols) {
            console.log('Nenhum símbolo válido encontrado');
            alert('Nenhum símbolo válido para atualizar');
            isProcessing = false;
            return;
        }

        console.log('Símbolos enviados para API:', symbols);
        // Nova chave da API externa
        const apiKey = '496b3693209c4eb6875da289dcd947dd';
        const url = `https://api.currencyfreaks.com/latest?apikey=${apiKey}&symbols=${symbols}`;

        try {
            const response = await fetch(url);
            console.log('Status da resposta da API externa:', response.status);
            if (!response.ok) throw new Error(`Erro ${response.status}`);
            const data = await response.json();
            console.log('Dados recebidos da API:', data);
            const rates = data.rates || {};

            // Salva a taxa do BRL, se disponível
            if (rates['BRL']) {
                brlRateUSD = parseFloat(rates['BRL']);
                console.log(`Taxa do BRL atualizada: ${brlRateUSD}`);
            } else {
                brlRateUSD = null;
                console.log('Taxa do BRL não retornada pela API');
            }

            // Atualiza apenas as moedas na watchlist
            const updatePromises = localWatchlist.map(async currency => {
                if (rates[currency.code]) {
                    const newRate = parseFloat(rates[currency.code]);
                    try {
                        const response = await fetch(`http://127.0.0.1:5000/currencies/${currency.code}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ rate: newRate })
                        });
                        if (!response.ok) {
                            throw new Error(`Erro ao atualizar ${currency.code}`);
                        }
                        const updatedData = await response.json();
                        console.log(`Taxa atualizada para ${currency.code}:`, updatedData);
                        currency.rate = updatedData.rate ? parseFloat(updatedData.rate).toFixed(6) : '---';
                        currency.updated_at = updatedData.updated_at || null;
                        return updatedData;
                    } catch (error) {
                        console.warn(`Erro ao atualizar ${currency.code}:`, error);
                        return null;
                    }
                }
                return null;
            });

            // Aguarda todas as atualizações
            await Promise.all(updatePromises.filter(p => p !== null));

            console.log('localWatchlist após atualização:', JSON.stringify(localWatchlist, null, 2));
            updateDisplayRates();
            console.log('Taxas atualizadas com sucesso');
        } catch (error) {
            console.error('Erro na atualização:', error);
            alert(`Erro ao atualizar taxas: ${error.message}`);
        } finally {
            isProcessing = false;
        }
    }

    function updateDisplayRates() {
        console.log('Atualizando exibição para moeda base:', baseSelect.value);
        console.log('localWatchlist:', JSON.stringify(localWatchlist, null, 2));
        console.log(`Taxa do BRL em USD (salva): ${brlRateUSD}`);
        const baseCurrency = baseSelect.value;
        const cards = document.querySelectorAll('.card');
        if (cards.length === 0) return;

        cards.forEach(card => {
            const currencyCode = card.id.replace('card-', '');
            const rateElement = card.querySelector('.rate');
            const updatedAtElement = card.querySelector('.updated_at');
            const currencyInList = localWatchlist.find(c => c.code === currencyCode);

            if (currencyInList && currencyInList.rate !== '---' && currencyInList.rate != null) {
                const rateUSD = parseFloat(currencyInList.rate);
                let rateToDisplay;

                if (baseCurrency === 'USD') {
                    rateToDisplay = rateUSD;
                } else if (baseCurrency === 'BRL') {
                    if (brlRateUSD && !isNaN(brlRateUSD) && rateUSD !== 0) {
                        rateToDisplay = brlRateUSD / rateUSD; // Quantos BRL por 1 unidade da moeda
                        console.log(`Convertendo ${currencyCode} para BRL: ${brlRateUSD} / ${rateUSD} = ${rateToDisplay}`);
                    } else {
                        rateToDisplay = '---';
                        console.log(`BRL não disponível para conversão de ${currencyCode}`);
                    }
                } else {
                    rateToDisplay = '---';
                }

                rateToDisplay = typeof rateToDisplay === 'number' && !isNaN(rateToDisplay) ? rateToDisplay.toFixed(6) : '---';
                rateElement.textContent = `Taxa: ${rateToDisplay}`;
                // Ajuste explícito para BRT (UTC-3)
                let displayDate = '---';
                if (currencyInList.updated_at) {
                    const date = new Date(currencyInList.updated_at);
                    // Subtrai 3 horas (10800000 ms) para converter de UTC para BRT
                    date.setTime(date.getTime() - 3 * 60 * 60 * 1000);
                    displayDate = date.toLocaleString('pt-BR');
                }
                updatedAtElement.textContent = `Atualizado: ${displayDate}`;
                console.log(`Exibindo taxa para ${currencyCode} em ${baseCurrency}: ${rateToDisplay}`);
            } else {
                console.log(`Nenhuma taxa válida para ${currencyCode}`);
                rateElement.textContent = 'Taxa: ---';
                updatedAtElement.textContent = 'Atualizado: ---';
            }
        });
    }

    // Busca a taxa inicial do BRL e carrega a watchlist
    await fetchInitialBRLRate();
    await loadWatchlist();
    updateRatesButton.addEventListener('click', updateRates);
    baseSelect.addEventListener('change', updateDisplayRates);
});
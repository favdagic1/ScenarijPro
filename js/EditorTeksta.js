let EditorTeksta = function (divRef) {
    // Validacija div elementa
    if (!divRef || divRef.tagName !== 'DIV') {
        throw new Error("Pogresan tip elementa!");
    }

    if (divRef.getAttribute('contenteditable') !== 'true') {
        throw new Error("Neispravan DIV, ne posjeduje contenteditable atribut!");
    }

    // Privatni atributi
    let editorDiv = divRef;

    // Pomoćne privatne funkcije

    /**
     * Uzima čist tekst iz elementa, bez HTML oznaka
     */
    let dajCistiTekst = function(element) {
        return element.textContent || element.innerText || '';
    };

    /**
     * Parsira tekstualni sadržaj editora u linije
     */
    let dajLinije = function() {
        let tekst = editorDiv.innerHTML;
        let tempDiv = document.createElement('div');
        tempDiv.innerHTML = tekst;

        let linije = [];
        let paragrafi = tempDiv.querySelectorAll('p');

        paragrafi.forEach(p => {
            linije.push({
                element: p,
                tekst: dajCistiTekst(p).trim()
            });
        });

        return linije;
    };

    /**
     * Prebrojava riječi u tekstu
     */
    let prebrojiRijeci = function(tekst) {
        if (!tekst || tekst.trim() === '') return 0;

        // Znakovi interpunkcije (samo zarez i tačka prema postavci)
        tekst = tekst.replace(/[,.]/g, ' ');

        // Razdvoji na riječi
        let rijeci = tekst.trim().split(/\s+/);

        // Filtriraj brojeve i prazne stringove
        rijeci = rijeci.filter(rijec => {
            return rijec.length > 0 && !/^\d+$/.test(rijec);
        });

        return rijeci.length;
    };

    /**
     * Provjerava da li je linija naslov scene
     */
    let jeLiNaslovScene = function(tekst) {
        tekst = tekst.trim();

        // Mora biti velikim slovima
        if (tekst !== tekst.toUpperCase()) return false;

        // Mora početi sa INT. ili EXT.
        if (!tekst.startsWith('INT.') && !tekst.startsWith('EXT.')) return false;

        // Mora sadržavati jednu od ključnih riječi nakon crtice
        let kljucneRijeci = ['DAY', 'NIGHT', 'AFTERNOON', 'MORNING', 'EVENING'];
        let imaKljucnuRijec = kljucneRijeci.some(rijec =>
            tekst.includes('- ' + rijec)
        );

        return imaKljucnuRijec;
    };

    /**
     * Provjerava da li je linija ime uloge
     */
    let jeLiImeUloge = function(tekst, sljedecaTekst) {
        tekst = tekst.trim();

        // Mora biti velikim slovima
        if (tekst !== tekst.toUpperCase()) return false;

        // Ne smije biti naslov scene
        if (jeLiNaslovScene(tekst)) return false;

        // Ne smije biti prazan
        if (tekst === '') return false;

        // Ne smije sadržavati brojeve ili znakove interpunkcije
        if (/[0-9,.]/.test(tekst)) return false;

        // Mora sadržavati barem jedno slovo
        if (!/[A-Z]/.test(tekst)) return false;

        // Sljedeća linija mora postojati i biti običan govor
        if (!sljedecaTekst || sljedecaTekst.trim() === '') return false;
        if (sljedecaTekst.trim() === sljedecaTekst.trim().toUpperCase()) return false;

        return true;
    };

    /**
     * Provjerava da li je linija u potpunosti u zagradama
     */
    let jeLiLinijaUZagradama = function(tekst) {
        tekst = tekst.trim();
        return tekst.startsWith('(') && tekst.endsWith(')');
    };

    /**
     * Izračunava Levenshtein distancu između dva stringa
     */
    let levenshteinDistanca = function(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = [];

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[len1][len2];
    };

    // Javne metode

    /**
     * Vraća broj riječi (ukupno, boldiranih, italic)
     */
    let dajBrojRijeci = function () {
        // Implementacija u sljedećem koraku
        return { ukupno: 0, boldiranih: 0, italic: 0 };
    };

    /**
     * Vraća jedinstvene uloge
     */
    let dajUloge = function () {
        // Implementacija u sljedećem koraku
        return [];
    };

    /**
     * Detektuje potencijalno pogrešno napisane uloge
     */
    let pogresnaUloga = function () {
        // Implementacija u sljedećem koraku
        return [];
    };

    /**
     * Vraća broj linija teksta za ulogu
     */
    let brojLinijaTeksta = function (uloga) {
        // Implementacija u sljedećem koraku
        return 0;
    };

    /**
     * Vraća scenarij uloge sa kontekstom
     */
    let scenarijUloge = function (uloga) {
        // Implementacija u sljedećem koraku
        return [];
    };

    /**
     * Grupira uloge po dijalog-segmentima
     */
    let grupisiUloge = function () {
        // Implementacija u sljedećem koraku
        return [];
    };

    /**
     * Formatira selektovani tekst
     */
    let formatirajTekst = function (komanda) {
        // Implementacija u sljedećem koraku
        return false;
    };

    // Vraćamo javne metode
    return {
        dajBrojRijeci: dajBrojRijeci,
        dajUloge: dajUloge,
        pogresnaUloga: pogresnaUloga,
        brojLinijaTeksta: brojLinijaTeksta,
        scenarijUloge: scenarijUloge,
        grupisiUloge: grupisiUloge,
        formatirajTekst: formatirajTekst
    };
};

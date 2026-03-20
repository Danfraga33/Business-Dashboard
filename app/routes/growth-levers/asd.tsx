import cheerio from "cheerio"

async function scrapAnthony() {
    const url = "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html"

    const response = await fetch(url)
    const $ = cheerio.load(response);

    const pTags = $("div.md-content p")
    const textContent = pTags.map((i: string,p:string) => $(p).text())
    return textContent

}

    console.log(scrapAnthony())

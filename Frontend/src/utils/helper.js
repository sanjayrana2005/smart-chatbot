// to identify double star or replace it

export const checkHeading = (str) =>{
    return /^(\*)(\*)(.*)\*$/.test(str)  // to check starting with ** or ending with ** ex- **Explain AI**
}

export const replaceStar = (str) =>{
    return str.replace(/^(\*)(\*)|(\*)$/g,"")
}
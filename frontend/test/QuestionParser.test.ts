import parseString from "../src/helpers/ParseString";


describe("Parse returns correct value", () => {
    const parsed_code = "some code"
    const width = "42px"
    const src = "hex_code"


    const code = "```java\nsome code```"
    const text = "Some text"
    const image = "![42px](hex_code)"


    const image_is_valid = (tokens: any, idx: number) => {
        expect(tokens[idx].props.src).toEqual(src)
        expect(tokens[idx].props.width).toEqual(width)
    }

    const code_is_valid = (tokens: any, idx: number) => {
        expect(tokens[idx].props.children).toEqual(parsed_code)
    }

    const text_is_valid = (tokens: any, idx: number) => {
        expect(tokens[idx].props.children.props.children).toEqual(text)
    }

    it("code text", () => {
        const tokens = parseString(code + text)
        expect(tokens.length).toBe(2)
        code_is_valid(tokens, 0)
        text_is_valid(tokens, 1)
    })

    it("code image", () => {
        const tokens = parseString(code + image)
        expect(tokens.length).toBe(2)
        code_is_valid(tokens, 0)
        image_is_valid(tokens, 1)

    })

    it("code code", () => {
        const tokens = parseString(code + code)
        expect(tokens.length).toBe(2)
        code_is_valid(tokens, 0)
        code_is_valid(tokens, 1)
    })

    it("text image", () => {
        const tokens = parseString(text + image)
        expect(tokens.length).toBe(2)
        text_is_valid(tokens, 0)
        image_is_valid(tokens, 1)
    })

    it("text code", () => {
        const tokens = parseString(text + code)
        expect(tokens.length).toBe(2)
        text_is_valid(tokens, 0)
        code_is_valid(tokens, 1)
    })

    it("text text", () => {
        const tokens = parseString(text + text)
        expect(tokens.length).toBe(1)
        expect(tokens[0].props.children.props.children).toEqual(text + text)
    })

    it("image code", () => {
        const tokens = parseString(image + code)
        expect(tokens.length).toBe(2)
        image_is_valid(tokens, 0)
        code_is_valid(tokens, 1)
    })

    it("image text", () => {
        const tokens = parseString(image + text)
        expect(tokens.length).toBe(2)
        image_is_valid(tokens, 0)
        text_is_valid(tokens, 1)
    })

    it("image image", () => {
        const tokens = parseString(image + image)
        expect(tokens.length).toBe(2)
        image_is_valid(tokens, 0)
        image_is_valid(tokens, 1)
    })
})

export {}
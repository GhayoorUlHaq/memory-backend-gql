const {gql} = require("apollo-server");

const addCoverResponse = gql`
    type AddCoverResponse {
    status: Boolean!
    message: String!
    id: String!
  }
`

const coverType = gql`
    type Border {
        unit: String
        value: String
    }

    type Styles {
        justifyContent: String
        alignItems: String
        position: String
        width: String
        height: String
        resizeMode: String
        fontFamily: String
        fontSize: Int
        color: String
        textAlign: String
        borderRadius: Border
        letterSpcOfText: Int
        lineHeight: Int
        padding: Int
    }

    type Image {
        imageSource: String
        styles: Styles
    }

    type Text {
        title: String
        styles: Styles
    }

    type DragTextStyles {
        x: Int
        y: Int
        w: Int
        h: Int
    }

    type TextContainer {
        text: Text
        styles: Styles
        dragTextStyles: DragTextStyles
    }

  type Cover {
    imageBackground: Image
    image: Image
    textContainer: TextContainer
  }

`

const inputCoverType = gql`
    input BorderInput {
        unit: String
        value: String
    }

    input StylesInput {
        justifyContent: String
        alignItems: String
        position: String
        width: String
        height: String
        resizeMode: String
        fontFamily: String
        fontSize: Int
        color: String
        textAlign: String
        borderRadius: BorderInput
        letterSpcOfText: Int
        lineHeight: Int
        padding: Int

    }

    input ImageInput {
        imageSource: String
        styles: StylesInput
    }

    input TextInput {
        title: String
        styles: StylesInput
    }

    input DragTextStylesInput {
        x: Int
        y: Int
        w: Int
        h: Int
    }

   input TextContainerInput {
        text: TextInput
        styles: StylesInput
        dragTextStyles: DragTextStylesInput
    }

  input InputCover {
    imageBackground: ImageInput
    image: ImageInput
    textContainer: TextContainerInput
  }

`


module.exports = {
    coverType,
    inputCoverType,
    addCoverResponse
};



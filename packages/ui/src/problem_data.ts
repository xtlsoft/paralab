import verb from "./verb"

import problem from "../../bizserver/src/proto/problem"

let lowverb = verb.toLowerCase()

let problem_data_fake = [
    {
        "id" : 1,
        "name" : "Hello World",
        "acceptance" : 100,
        "desciption" : "Print \"Hello World!\"",
        "input_sample" : "",
        "output_sample" : "Hello World!"
    },
    {
        "id" : 2,
        "name" : "" + verb + " syc",
        "acceptance" : 99,
        "desciption" : "In this problem, you need to " + lowverb + " syc properly.",
        "input_format" : "One line, a question.",
        "output_format" : "One line, you answer to the question.",
        "input_sample" : "Do you wanna " + lowverb + " syc?",
        "output_sample" : "Yes!"
    },
]

let family = [
    "mother", 
    "father", 
    "brother", 
    "ssister", 
    "daughter",
    "grandfather",
    "grandmother",
    "grandson",
    "granddaugher"
]

for (let i = 0; i < family.length; i++) {
    let x = family[i];
    problem_data_fake.push ({
        "id" : i + 3,
        "name" : "" + verb + " syc's " + x,
        "acceptance" : 99 + 0.1 * (i + 1),
        "desciption" : "In this problem, you need to " + lowverb + " syc's " + x + " properly.",
        "input_format" : "One line, a question.",
        "output_format" : "One line, you answer to the question.",
        "input_sample" : "Do you wanna " + lowverb + " syc's " + x + "?",
        "output_sample" : "Yes!"
    })
}

export default problem_data_fake;
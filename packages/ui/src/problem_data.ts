import verb from "./verb"

let lowverb = verb.toLowerCase()

let problem_data_fake = [
    {
        "id" : 1,
        "name" : "Hello World",
        "acceptance" : 100,
        "desciption_md" : "## 题目描述\n输出 \"Hello World!\n\"",
    }
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
        "id" : i + 2,
        "name" : "" + verb + " syc's " + x,
        "acceptance" : 99 + 0.1 * (i + 1),
        "desciption_md" : "\
## 题目描述\n\
In this problem, you need to " + lowverb + " syc's " + x + " properly.\n\
## 输入格式\n\
One line, a question.\n\
## 输出格式\n\
One line, you answer to the question.\n",
    })
}

export default problem_data_fake;
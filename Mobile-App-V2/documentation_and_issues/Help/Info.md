
// Loops help
/* From fastest to longest to loop through a Million numbers

// 1.73 ms
for (let i = 0; i < array; i++) {
}


// 1.93 ms
array.forEach(v => {  })


// 11.71 ms
for (const v of array) {
}

*/












// Date help
/*

// Creating dates 
let date = new Date('2022-04-06T10:48:14.223Z')
var date = new Date(Date.UTC(2012, 11, 20, 3, 0, 0, 200))



// Formatting dates
Wed Apr 06 2022                            (toDateString)
2022-04-06T10:48:14.223Z                   (toISOString) -> UTC
2022-04-06T10:48:30.003Z                   (toJSON) ->  UTC
06/04/2022                                 (toLocaleDateString)
06/04/2022 à 12:48:47                      (toLocaleString)
12:48:55                                   (toLocaleTimeString)
Wed Apr 06 2022 12:49:10 GMT+0200 (CEST)   (toString)
12:49:17 GMT+0200 (CEST)                   (toTimeString)
Wed, 06 Apr 2022 10:49:24 GMT              (toUTCString)


// Getting day index 
date.getUTCDay() returns the day index on the week [0-6] (e.g. 3 = Wednesday and 6 = Saturday)


// Getting day name in user's language (e.g. 'Sunday')
// P.S : the first letter has to be capitalised when language is not english.
date.toLocaleString('fr-FR', { weekday: 'long'}) 


// Custom format
console.log(date.toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric', 
    year: 'numeric',
    month: 'long', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
}))


*/






Arrays help 

Adding items 

    // Adds to array directly
    setArray(prevV => [...prevV, array.length])

    // Adds to array directly
    setArray([...array, array.length])

    // Adds to array less diretly
    let newArray = array.concat(array.length)
    setArray(newArray)






// Updating all items warning 
  
 // Proper way to do it for UI 
const [values, setValues] = useState(['1', '2', '3'])

function someFuncrion() {}
    setValues([])
    setValues(prevV => {
            alert(`prevV : ${prevV}`) // empty 
            alert(`issue : ${values}`) // Dos not reflactes the changes (As function not re rendered and not using prevV method.)
            return [...prevV, '4']
     })
 }



         // const valuesCopy = [...values] // <-- shallow copy
              // valuesCopy[0] = newValue    // <-- this is a mutation of the current state!!
              // setValues(valuesCopy)
        console.log(values)







// Generating id 
        let array = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
        // 1 
        let page_id = '' 

        do {
             page_id = generateID(1, true) // iterator
        } while (array.filter(e => {return e === page_id}).length > 0) // condition





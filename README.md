COMP 3612 Assignment #2: Single-Page App

 **Overview**
This repository holds code that implements a single page F1 Racing Dashboard, emphasizing the use of hiding modals. The project aims to keep track of F1 Racing results for the years 2020-2023 using web APIs to retrieve data, allowing users to view specific driver, constructor and circuit details, as well as save their favorites. The implementation uses cacheing for the seasons data in order to significantly improve performane. In terms of design, the data is presented with emphasis on contrast for visibility. To communicate that an item is clickable, hover styles using color changes, background color changes and borders were used following the red and black theme throughout.
 
! Intended design doesn't appear to be accurate in Safari. Google Chrome, Firefox, or Edge displays it accurately.

**Technologies Used**
HTML, CSS (+TailwindCSS), JavaScript

**Limitations:** 
Due to time constraints, there are opportunities to refactor code such as functions for rendering race/qualifying results, favorites handling and some lengthy event handlers. As well, this version was not able to comply with the recommended flow in v1.4 (Nov.22,2024) of the project specifications; For the same reason, it also implements the favorite icon handling. Additionally, loading animations were not implemented.

**Notes on Styling:** 
The implementation uses TailwindCSS for styling. It is worth noting that there were some issues faced using the blur and scrollbar styling through Tailwind, therefore there is a short instance CSS in the index.html file that mimics the class-oriented design to keep the implementation consistent.

**Added features:** This implementation includes a favorite icon beside the favorite drivers/constructors/circuits; There could be improvements on this as it simply searches the favorites and adds the icon upon re-rendering results. Additionally, this implementation allows the user to singly remove favorites in the favorites pop-up.

**References**

**F1 Logo**

https://www.freepik.com/icon/f1_2418802#fromView=search&page=1&position=4&uuid=a9e82bbc-b0aa-4e55-b8fb-073e342dd579

**Background**

https://www.freepik.com/free-ai-image/automobile-racing-sports-competition_66622095.htm#fromView=keyword&page=1&position=2&uuid=127fc301-0290-4344-9744-f11cb440bcda

**Dropdown Menu Styling**

https://flowbite.com/docs/components/dropdowns/#:~:text=Dropdown%20example,of%20the%20dropdown%20menu%20element.

**Circuit Placeholder**

https://oversteer48.com/f1-circuits-from-space/


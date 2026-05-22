# Assessment Answers

## 1. How to run

Install dependencies:

```bash
npm install
This project requires Node.js and npm. I did not deploy the app because deployment was optional.
2. Stack & design choices
I used React with Vite because the app has several pieces of state that need to stay in sync: the habit list, the selected week, the checkmark data, and the calculated streaks. Vite also makes the project quick to start and simple to run locally.
One design decision I made was to use a weekly grid instead of a vertical list of days. The grid makes it easier to compare habits across the same week at a glance. Habits are listed down the left side, and the seven days of the selected week run across the top, so the user can quickly scan both habit progress and daily completion.
Another design decision was to highlight today's column with a subtle background instead of a strong color. The user needs to know where today is, but the completed checkmarks should remain the most important visual signal. This keeps today's position visible without making the interface feel noisy.
I chose Monday as the start of the week because it matches how many people plan habits around a work or school week. It also keeps the weekend grouped at the end of the grid.
For streaks, I count the current consecutive completed days ending today. If today has not been checked yet, I count the streak ending yesterday. I chose this because it avoids making a user feel like their streak is broken early in the day before they have had a chance to complete the habit.
3. Responsive & accessibility
On a 1440px laptop, the tracker shows as a full weekly grid with habits, streaks, and all seven days visible. This layout supports quick scanning and comparison across the week.
On a 360px phone, the layout keeps the add form and navigation stacked vertically, and the tracker grid can scroll horizontally. I chose horizontal scrolling for the grid because squeezing seven days, habit names, and streaks into a narrow screen would make the information harder to read.
One accessibility consideration I handled is that the checkmark cells are real buttons with descriptive aria-labels. For example, a screen reader can announce whether the user is marking or unmarking a specific habit for a specific date. The app also keeps visible focus and hover states for interactive elements.
One accessibility improvement I skipped is more advanced table semantics for the habit grid. With another day, I would improve the row and column relationships for screen readers so the grid behaves more like a fully accessible data table.
4. AI usage
I used ChatGPT to help interpret the assessment requirements and break the project into implementation steps. It helped identify the core features: habit CRUD, weekly grid, checkmarks, streaks, week navigation, localStorage persistence, empty state, responsive behavior, and accessibility considerations.
I also used ChatGPT to help design the localStorage data shape. The suggested approach was to store habits separately from checkmarks, with checkmarks keyed by habit ID and ISO date string. I kept that structure because it made week navigation and streak calculation easier.
One thing I changed from the AI guidance was the visual layout. The initial suggestion was mostly functional, but I adjusted the design so the current day is highlighted subtly and completed cells use a stronger visual state. I did this because the assessment emphasizes information design and the user needs to understand progress at a glance.
5. Honest gap
One thing that is not polished enough is the rename interaction. It works, but it is basic. With another day, I would add clearer save and cancel buttons, stronger validation for duplicate habit names, and better focus handling after saving or cancelling a rename.

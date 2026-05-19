# Seeing your whole app at once

Every React project I've worked on has the same problem. To check screen 14, you click through screens 1 through 13. Login. Dashboard. Open a project. Drill into settings. Pick the right tab. Edit a field. Submit. Wait for the modal. Then — finally — the thing you wanted to look at.

By the time you get there, you've forgotten what you were checking.

Designers don't work this way. In Figma, every screen sits on a board. You see the whole flow at once. You drag a line from one to another and say "this button takes you here." The shape of the product is right in front of you.

I wanted that for code.

## The "what if"

What if you ran a command in your project and a canvas appeared with every screen of your app laid out side by side? Real, live, running React — not screenshots. Click a button in one screen and the canvas pans to the next. The whole product visible at once, the way designers see it.

I started with five screens and a hardcoded layout, just to see if the feeling worked. It did. Watching the canvas glide from Login to Dashboard when I clicked a button felt like magic. That was enough to keep going.

## The hard parts

Most of the work after that wasn't the visible stuff. It was the plumbing.

Reading routes from code automatically meant teaching a program to understand React Router and Next.js — every flavor, every way developers write them. Some apps put routes in one tidy file. Others scatter them across a hundred. Some use folder structure. Some generate routes from configs that point to other configs.

Then there was the browser. Putting a real, running app inside a small frame on a canvas is fighting the browser's security rules the whole way. I went through three failed approaches before landing on the one that works. (The trick: copy a tiny script into the user's project, so the browser treats everything as one app.)

Then performance. The first time I tested it on a real app — 122 screens — the browser crashed. Every screen was trying to load at the same time, opening thousands of connections. I had to slow it down, queue things up, and only load what was actually on screen.

Each problem had the same lesson: real apps look nothing like the demo you build to prove the idea.

## What it became

It's called **Mappd**. You run `npx mappd dev` next to your React project and a canvas opens in your browser. Every screen, every route, every flow line — drawn automatically. Click around. Pan between screens. See the shape of what you've built.

It works on Next.js. It works on React Router. I tested it on Cal.com (an open-source app with 41,000 stars) and it mapped out 205 screens correctly on the first try.

It's free and open source: [github.com/uxderrick/mappd](https://github.com/uxderrick/mappd)

## What I learned

Three things, mostly.

**Scratch your own itch.** The whole reason this project survived past the first weekend is that I needed it. Every time I got stuck, I remembered why I started.

**Demos lie.** Your toy project will not surface the problems real users have. The day I ran it on a stranger's codebase was the day I learned what I was actually building.

**Show the shape, not the details.** People understood Mappd the moment they saw the canvas. No explanation. Same reason Figma works — the picture does the talking.

The tool started small and stayed small. That's the part I'm most happy about.

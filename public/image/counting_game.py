# Simple counting game for Lesson 7: Numbers & Counting
# This is written in kid-friendly style with lots of comments so a student
# can read the code and learn how Python "understands" integers versus strings.

import random  # used for generating a random number (like rolling a die)

print("Welcome to the Counting Game!")
print("The computer will show you a bunch of emojis, and you have to count them.")
print("Type 'exit' at any time to quit the game.")

# The main loop keeps the game running until the user types 'exit'.
while True:
    # "The Computer's Brain" – Python chooses a number it can do math with.
    # random.randint(1, 20) returns an integer between 1 and 20 inclusive.
    # It's like the computer is rolling a 20‑sided die.
    number = random.randint(1, 20)

    # "The Computer's Eyes" – create a string of emoji characters.
    # Because the emoji characters are placed inside quotes, Python treats
    # them as strings (text) and simply repeats the text `number` times.
    emojis = "🍎" * number

    # show the emojis on one line and ask the question
    print("\nHow many apples do you see?")
    print(emojis)

    # input() is how Python listens to the student. It always returns a string.
    answer = input("Your answer (or 'exit' to quit): ")

    # allow the kid to exit the loop by typing 'exit'
    if answer.lower() == "exit":
        print("Thanks for playing! See you next time.")
        break

    # input() returns a string. if the student types 5, answer == "5" (a string),
    # which is not the same as the integer 5. That's why we convert it with int().
    if not answer.isdigit():
        print("Please type a number or 'exit'.")
        continue

    # convert the string to an integer so Python can compare numerically
    guess = int(answer)

    # if/else – computer makes a decision based on the count
    if guess == number:
        # correct guess
        print("Great job! You are a counting master!\n")
    else:
        # wrong guess: gently show the correct answer and count together
        print(f"Oops, the correct answer was {number}. Let's count together:")
        # step-by-step counting demonstration
        for i in range(1, number + 1):
            print(i)
        print()

# by the time the loop finishes the program will exit
print("Game over.")

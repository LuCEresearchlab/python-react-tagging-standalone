import numpy as np

elements = """0.25 0.18 0.12 0.13 0.32 0.20 0.18 0.12 0.15 0.07 0.20 0.10 0.18 0.26 0.14 0.15 0.25 0.07 0.23 0.20"""

numbers = [float(s) for s in elements.split(' ')]

print(np.mean(numbers))
print(np.std(numbers))

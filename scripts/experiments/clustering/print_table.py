import pathlib

file = pathlib.Path("timing_results_agglomerative_average")

with open(file, 'r') as file:
    index = 0
    transformation = ['raw', 'clean_answers_only_lowercase', 'clean_answers_only_stopwords',
                      'clean_answers_only_lemma', 'clean_answers_stopwords_lemma', 'clean_answers_full']

    line = file.readlines()
    for line in line:
        if line.startswith('clustering'):
            print('clustering time:', line)
            transformation[index % len(transformation)] = transformation[
                                                              index % len(transformation)] + "&{:10.1f}".format(
                float(line.split(':')[1]) / 1_000_000)
            index = index + 1

    for row in transformation:
        print(row)

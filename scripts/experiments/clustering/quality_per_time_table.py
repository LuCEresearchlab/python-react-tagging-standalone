import pathlib

file = pathlib.Path("timing_results_agglomerative_average")
quality_file = pathlib.Path("output_agglomerative_average")

with open(file, 'r') as file:
    index = 0
    transformation = ['raw', 'clean_answers_only_lowercase', 'clean_answers_only_stopwords',
                      'clean_answers_only_lemma', 'clean_answers_stopwords_lemma', 'clean_answers_full']

    quality = [0 for x in range(len(transformation))]
    time = [0 for x in range(len(transformation))]

    line = file.readlines()

    for line in line:
        if line.startswith('clustering'):
            print('clustering time:', line)
            cluster_time_s = float(line.split(':')[1]) / 1_000_000

            time[index % len(transformation)] = time[index % len(transformation)] + cluster_time_s
            index = index + 1

    current_transformation = 0
    with open(quality_file, 'r') as quality_file:
        quality_lines = quality_file.readlines()
        for line in quality_lines:
            for idx, t in enumerate(transformation):
                if t in line:
                    current_transformation = idx

            if line.startswith('mean: '):
                quality[current_transformation] += float(line.split(':')[1])

    output = []

    for idx in range(len(transformation)):
        output.append("(" + "{:1.6f}".format(quality[idx] / time[idx]) + f", {transformation[idx]})")

    print(" ".join(output))

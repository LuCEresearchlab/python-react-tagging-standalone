from src.util.answers_loader import load_data, Answer

data = load_data()


class TestDataLoader:

    def test_load_data(self):
        assert data is not None
        assert type(data) is list
        assert len(data) > 0

    def test_loaded_data_structure(self):
        for group in data:
            assert type(group) is list
            assert len(group) > 0

            for element in group:
                assert type(element) is Answer
                assert element is not None

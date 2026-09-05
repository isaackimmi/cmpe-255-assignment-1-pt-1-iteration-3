# Dataset Acquisition Instructions

This project utilizes the **European Soccer Database** by Hugo Mathien hosted on Kaggle:
🔗 [https://www.kaggle.com/datasets/hugomathien/soccer](https://www.kaggle.com/datasets/hugomathien/soccer)

## Setup Steps

1. Download the archive from Kaggle (`soccer.zip`).
2. Extract the archive to find `database.sqlite`.
3. Place the file at:
   ```text
   cmpe-255-assignment-1-pt-1-iteration-3/data/database.sqlite
   ```

## Tables Utilized
- **Match**: Match dates, scores, league ID, home/away team IDs, and pre-match betting odds (`B365H`, `B365D`, `B365A`).
- **Team**: Team API IDs and team long/short names.
- **League**: League IDs and competition names.
- **Country**: Country IDs and country names.

*Note: In accordance with data science best practices and Git size limitations, the raw SQLite file is git-ignored.*

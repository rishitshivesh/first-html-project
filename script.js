const fs = require('fs');
const path = require('path');

// Function to read and update files recursively
function readFilesRecursively(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Could not list the directory: ${err}`);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (error, stat) => {
        if (error) {
          console.error(`Error stating file: ${error}`);
          return;
        }

        if (stat.isFile()) {
          // Update file paths in HTML, JS, and CSS files
          if (['.html', '.js', '.css'].includes(path.extname(file))) {
            updateFilePaths(filePath);
          }

          // Convert filename to lowercase
          const lowerCaseFilePath = path.join(directory, file.toLowerCase());
          if (filePath !== lowerCaseFilePath) {
            fs.rename(filePath, lowerCaseFilePath, (renameError) => {
              if (renameError) {
                console.error(`Error renaming file: ${renameError}`);
              }
            });
          }
        } else if (stat.isDirectory()) {
          // Recurse into the directory
          readFilesRecursively(filePath);
        }
      });
    });
  });
}

// Function to update paths in HTML, JS, and CSS files
function updateFilePaths(filePath) {
  fs.readFile(filePath, 'utf8', (readError, data) => {
    if (readError) {
      console.error(`Error reading file: ${readError}`);
      return;
    }

    // Replace all paths with lowercase paths in HTML, JS, and CSS files
    const updatedData = data
      .replace(/(src|href|url)\s*=\s*["']([^"']+)["']/gi, (match, p1, p2) => {
        return `${p1}="${p2.toLowerCase()}"`;
      })
      .replace(/url\s*\(\s*['"]?([^'")]+)['"]?\s*\)/gi, (match, p1) => {
        return `url(${p1.tolowercase()})`;
      })
      .replace(/import\s+["']([^"']+)["']/gi, (match, p1) => {
        return `import "${p1.tolowercase()}"`;
      })
      .replace(/import\s+(\{[^}]+\})\s+from\s+["']([^"']+)["']/gi, (match, p1, p2) => {
        return `import ${p1} from "${p2.toLowerCase()}"`;
      });

    fs.writeFile(filePath, updatedData, 'utf8', (writeError) => {
      if (writeError) {
        console.error(`Error writing file: ${writeError}`);
      }
    });
  });
}

// Start processing from the given directory
const directoryPath = '.'; // Replace with your directory path
readFilesRecursively(directoryPath);

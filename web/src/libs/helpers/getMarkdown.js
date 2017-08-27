import {join} from 'path';
import {Markdown} from 'markdown-to-html';
import toArray from 'stream-to-array';

export function getMarkdown(path) {
    return new Promise((resolve, reject) => {
        let md = new Markdown();
        md.bufmax = 2048;

        md.render(path, {}, (err) => {
            if (err) {
                return reject(err);
            }

            toArray(md, (err, arr) => {
                if (err) {
                    return reject(err);
                }

                resolve(arr.join(''));
            });
        });
    });
}

export function getReadmeMarkdown(dir = ROOT_PATH) {
    return getMarkdown(join(dir, 'Readme.md'));
}

export class GithubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`;

    return fetch(endpoint).then(data => data.json())
      .then(({ login, name, public_repos, followers }) => ({
        login,
        name,
        public_repos,
        followers,
      }))
  }
}

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || [];    
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries));
  }

  async add(username) {
    const user = await GithubUser.search(username);

    try {
      const findUser = this.entries.find(entry => entry.login === username);

      if(findUser) {
        throw new Error('Usuário já adicionado!');
      }

      if(!user.login) {
        throw new Error('Usuário não encontrado.');
      }

      this.entries = [user, ...this.entries];

      this.update()
      this.save()

    } catch(err) {
      alert(err.message)
    }
  }


  delete(user) {
    const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

    this.entries = filteredEntries;

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root) 

    this.tbody = this.root.querySelector('tbody');

    this.update();
    this.onadd();
  }
  
  removeAllTr() {
    const tr = this.tbody.querySelectorAll('tr');
    
    tr.forEach((item) => item.remove());
  }
  
  update() {
    this.removeAllTr();
    
    this.entries.forEach((user) => {
      const row = this.createRow();

      row.querySelector('.user img').src = `https://github.com/${user.login}.png`;
      row.querySelector('.user p').textContent = `${user.name}`;
      row.querySelector('.user span').textContent = `${user.login}`;
      row.querySelector('.repositories').textContent = user.public_repos;
      row.querySelector('.followers').textContent = user.followers;
      row.querySelector('.user a').href = `https://github.com/${user.login}`;
      
      row.querySelector('.btn-remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar este usuário?');

        if(isOk) {
          this.delete(user);
        }
      }

      this.tbody.append(row);

    })
  }

  onadd() {
    const buttonAdd = this.root.querySelector('#btn-favorite');
    const input = this.root.querySelector('#input-search')

    buttonAdd.onclick = () => {
      const { value } = input;

      this.add(value);
      input.value = '';
    }
  }

  createRow() {
    const innerContent = `
    <tr>
          <td class="user" >
            <img src="https://github.com/devlucao.png" alt="Imagem de Lucas Freitas">
            <a href="https://github.com/devlucao" target="_blank">
              <p>Lucas Freitas</p>
              <span>/devlucao</span>
            </a>
          </td>
          <td class="repositories">
            123
          </td>
          <td class="followers">
            50000
          </td>
          <td>
            <button class="btn-remove">
              Remover
            </button>      
          </td>
        </tr>
    `

    const createTr = document.createElement('tr');
    createTr.innerHTML = innerContent;
    
    return createTr;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ArticleService } from '../Services/article.services';
import { ArticleModel } from '../models/article.model';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-keyword-search',
  standalone: true,
  templateUrl: './keyword-search.component.html',
  styleUrls: ['./keyword-search.component.scss'],
  imports: [CommonModule, RouterModule],
})
export class KeywordSearchComponent implements OnInit {
  keywords: string[] = [];
  selectedKeyword = '';
  filteredArticles: ArticleModel[] = [];
  showPopup = false;
  isLoading = false;
  isLoaded = false;
  defaultImage = 'https://via.placeholder.com/150'; // Placeholder URL

  constructor(private articleService: ArticleService, private router: Router) {}

  ngOnInit(): void {
    this.fetchKeywords();
  }

  fetchKeywords(): void {
    this.isLoading = true;
    const cachedKeywords = localStorage.getItem('keywords');

    if (cachedKeywords && cachedKeywords !== '[]') {
      try {
        this.keywords = JSON.parse(cachedKeywords);
        console.log('Keywords from cache:', this.keywords);
        this.isLoading = false;
      } catch (error) {
        console.warn('Error parsing cached keywords or empty cache:', error);
        this.fetchKeywordsFromFirebase();
      }
    } else {
      this.fetchKeywordsFromFirebase();
    }
  }

  fetchKeywordsFromFirebase(): void {
    this.articleService.getArticles().subscribe(
      (articles: ArticleModel[]) => {
        if (articles && articles.length) {
          const allKeywords: string[] = articles.flatMap(article => article.keywords || []);
          this.keywords = Array.from(new Set(allKeywords)); // Remove duplicates
          localStorage.setItem('keywords', JSON.stringify(this.keywords));
          console.log('Fetched keywords from Firebase:', this.keywords);
        } else {
          console.warn('No articles found.');
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching articles:', error);
        this.isLoading = false;
      }
    );
  }

  selectKeyword(keyword: string): void {
    this.selectedKeyword = keyword;
    this.fetchArticles(keyword);
    this.openPopup();
  }

  fetchArticles(keyword: string): void {
    this.isLoading = true;
    this.articleService.getArticles().subscribe(
      (articles: ArticleModel[]) => {
        this.filteredArticles = articles.filter(article =>
          (article.keywords || []).includes(keyword) ||
          article.articleHeadline.includes(keyword) ||
          article.articleContent?.content.includes(keyword)
        );
        console.log('Filtered articles:', this.filteredArticles);
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching articles:', error);
        this.isLoading = false;
      }
    );
  }

  getImageUrl(article: ArticleModel): string {
    // Return the first media file URL, or a default placeholder image
    return article.mediaFileUrls?.[0] || this.defaultImage;
  }


  openPopup(): void {
    this.showPopup = true;
    document.body.classList.add('no-scroll');
    setTimeout(() => {
      const popup = document.querySelector('.popup');
      popup?.classList.add('show');
    }, 10);
  }

  closePopup(): void {
    const popup = document.querySelector('.popup');
    popup?.classList.remove('show');
    setTimeout(() => {
      this.showPopup = false;
      this.selectedKeyword = '';
      this.filteredArticles = [];
      document.body.classList.remove('no-scroll');
    }, 300);
  }
}

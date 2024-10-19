import { Component, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ArticleService } from '../Services/article.services';
import { ArticleModel } from '../models/article.model';
import { CommonModule, ViewportScroller } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KeywordSearchComponent } from '../keyword-seach/keyword-search.component';
import { catchError, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, FormsModule, KeywordSearchComponent, RouterModule],
  providers: [ArticleService]
})
export class HomeComponent implements OnInit, AfterViewInit {
  articles: ArticleModel[] = [];
  topArticles: ArticleModel[] = [];
  topicArticles: ArticleModel[] = [];
  bigArticle?: ArticleModel;
  smallArticles: ArticleModel[] = [];
  isLoading = true;
  searchTerm = '';
  filteredArticles: ArticleModel[] = [];
  showPopup = false;
  defaultImage = 'https://via.placeholder.com/150'; // Placeholder URL

  constructor(private articleService: ArticleService, private router: Router, private viewportScroller: ViewportScroller, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.viewportScroller.scrollToPosition([0, 0]); // Scroll to top
      }
    });
    this.loadArticles();
  }

  ngAfterViewInit(): void {
    this.renderer.listen('window', 'scroll', () => {
      const topicCards = document.querySelector('.topic-articles-cards') as HTMLElement;
      if (topicCards) {
        topicCards.scrollLeft += window.scrollY - (window.scrollY - topicCards.offsetTop);
      }

    });
  }

  private loadArticles(): void {
    const storedArticles = localStorage.getItem('articles');

    if (storedArticles && storedArticles !== '[]') {
      this.articles = JSON.parse(storedArticles);
      this.processArticles();
    } else {
      this.fetchArticlesFromService();
    }
  }

  private fetchArticlesFromService(): void {
    this.articleService.getArticles().pipe(
      tap((articles: ArticleModel[]) => {
        this.articles = articles;
        localStorage.setItem('articles', JSON.stringify(articles));
        this.processArticles();
      }),
      catchError(error => {
        console.error('Error fetching articles:', error);
        this.showErrorNotification('Failed to process articles. Please try again later.');
        this.isLoading = false;
        return of([]); // Return an empty array on error
      })
    ).subscribe();
  }

  private processArticles(): void {
    this.loadArticleImages();
    this.selectRandomTopArticles();
    this.selectTopicSpecificArticles();
    this.selectBigAndSmallArticles();
    this.isLoading = false;

    setTimeout(() => {
      document.querySelector('.home-page')?.classList.add('loaded');
      document.querySelectorAll('.article-card, .hot-articles-container, .topic-articles-section, .banner')
        .forEach(element => element?.classList.add('loaded'));
    }, 100);
  }

  private loadArticleImages(): void {
    console.log('Loading article images...');
    this.articles.forEach(article => {
      if (article.mediaFileUrls && article.mediaFileUrls.length > 0) {
        console.log(`Article ${article.articleId} already has media URLs`, article.mediaFileUrls);
      } else {
        console.log(`Fetching media URL for article ${article.articleId}`);
      }
    });
  }

  private selectBigAndSmallArticles(): void {
    if (this.articles.length > 0) {
      this.bigArticle = this.articles[0];
      this.smallArticles = this.articles.slice(1, 10);
    }
  }

  private selectRandomTopArticles(): void {
    const numberOfTopArticles = 3;
    this.topArticles = this.shuffleArray(this.articles).slice(0, numberOfTopArticles);
  }

  private selectTopicSpecificArticles(): void {
    const keywords = ['Cloud', 'Security', 'Network Segmentation'];
    this.topicArticles = this.articles.filter(article =>
      article.articleHeadline?.trim() &&
      keywords.some(keyword => article.articleHeadline.includes(keyword))
    );
  }

  private shuffleArray(array: ArticleModel[]): ArticleModel[] {
    return array.sort(() => Math.random() - 0.5);
  }


  private showErrorNotification(message: string): void {
    console.error(message);
    alert(message);
  }
  getImageUrl(article: ArticleModel): string {
    // Return the first media file URL, or a default image if none exists
    return article.mediaFileUrls?.[0] || this.defaultImage;
  }

}

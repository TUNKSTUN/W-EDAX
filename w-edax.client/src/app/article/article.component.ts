// article.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../Services/article.services';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticlesComponent implements OnInit {
  articleId: string | null = null;
  article: any;

  constructor(private route: ActivatedRoute, private apiService: ArticleService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.articleId = params.get('id');
      if (this.articleId) {
        this.apiService.getArticleById(this.articleId).subscribe(data => {
          this.article = data;
        });
      }
    });
  }
}

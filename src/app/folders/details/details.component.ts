import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription, Subject } from 'rxjs';
import { BuilderService } from '../../core/services/builder/builder.service';
import { FileService } from '../../core/services/file/file.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'subscriptions-transport-ws';
import { IFileRawType } from '../../core/api-introspection';
import { switchMap, skip, map, tap } from 'rxjs/operators/index';
import { MonacoFile } from 'ngx-monaco';
import { LoggerService } from '../../core/services/logger/logger.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit {
  file: string;
  path: string;
  subscription: Subscription;
  form = this.formBuilder.group({
    namespace: ['', Validators.required],
    commit: ['', Validators.required]
  });
  defaultFileType: string = 'typescript';
  rawFile: Observable<IFileRawType>;
  fileMonaco: MonacoFile = {
    uri: 'index.js',
    language: this.defaultFileType,
    content: `console.log('hello world');`
  };
  loading: boolean = true;
  disabled: boolean = false;
  newFile: string;
  extension: string;
  fileChange = new Subject<MonacoFile>();
  stream: Observable<any>;
  @ViewChild('next') scroll: ElementRef;
  model;
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private buildService: BuilderService,
    private formBuilder: FormBuilder,
    private fileService: FileService,
    public serverLogger: LoggerService
  ) { }

  ngOnInit() {

    this.file = this.route.snapshot.paramMap.get('file');
    this.extension = this.file.split('.').pop();
    if (this.extension === 'json') {
      this.defaultFileType = 'json';
    }
    this.subscription = this.route.queryParams
      .subscribe(params => {
        this.path = params['path'];
        if(this.path) {
          this.fileService.readFile(this.path)
          .subscribe(stream => {
            if (stream.package) {
              stream.package = JSON.parse(stream.package);
              this.form.patchValue({
                namespace: stream.package['name']
              });
            }
            this.model = stream.file;
            this.fileMonaco.content = stream.file;
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      });

  }

  ngAfterViewInit() {
    this.stream = this.serverLogger.stream
      .pipe(
        skip(1),
        tap(() => this.scroll.nativeElement.scrollIntoView({ behavior: 'smooth' }))
      );
  }

  onFileChange(file: MonacoFile) {
    this.fileService.saveFile(this.path, this.model).subscribe(stream => console.log('Content saved'));
  }

  save() {

  }

  back() {
    this.location.back();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.serverLogger.clearLog();
  }

  isJsOrTs() {
    const extension = this.file.split('.').pop();
    return extension === 'js' || extension === 'ts';
  }

  deploy() {
    const folder = this.path.replace(this.file, '');
    this.disabled = true;
    this.buildService
      .build(folder, this.file, this.form.value.commit, this.form.value.namespace, `${folder}build`)
      .subscribe(
        () => this.disabled = false,
        () => this.disabled = false
      );
  }

  build() {

  }

}
